# Chat client integration (React Native + Redux Toolkit)

Portable guide for adding chat to a React Native / Expo project. Self-contained: copy the files, install deps, set env, done.

The client talks to a Rails ActionCable backend via WebSocket and an HTTP API. Messages, read-receipts, and new-room events are pushed in realtime; the cache is RTK Query, the message shape is `react-native-gifted-chat`-compatible.

---

## 1. Dependencies

```bash
npm i @kesha-antonov/react-native-action-cable @reduxjs/toolkit react-redux react-native-gifted-chat
```

If you use axios for HTTP (this guide assumes it):
```bash
npm i axios
```

## 2. Env vars

```
EXPO_PUBLIC_API_BASE_URL=https://your.host/api/v1/
EXPO_PUBLIC_CABLE_URL=wss://your.host/cable
```

`EXPO_PUBLIC_*` for Expo. For bare RN use `react-native-config` and rename.

## 3. Backend contract

### HTTP

| Method | Path | Body / Params | Response |
|---|---|---|---|
| `GET` | `/chat/rooms` | `?per_count=` | `{ rooms: ChatRoom[], pagination }` |
| `POST` | `/chat/rooms` | `{ user_id, customer_id }` | `ChatRoom` |
| `GET` | `/chat/rooms/:id` | — | `ChatRoom` |
| `PATCH` | `/chat/rooms/:id/read` | — | `204` |
| `PATCH` | `/chat/rooms/:id/membership` | `{ is_notify: bool }` | `204` |
| `GET` | `/chat/rooms/:id/feed` | `?before=ISO&limit=30` | `{ items: ChatMessage[], next_cursor }` |
| `POST` | `/chat/rooms/:id/messages` | multipart: `body?`, `appointment_id?`, `images[]?` | `ChatMessage` |

Auth: `Authorization: Bearer <JWT>` on every request.

### WebSocket

`wss://host/cable?token=<JWT>` (browsers / RN cannot send headers on WS handshake — token goes in query).

Two channels:

| Channel | Stream | Events |
|---|---|---|
| `ResourceChannel` | per current user/customer | `chat_room.created`, `notification.created` |
| `Chat::RoomChannel` | per `room_id` | `message.created`, `read` |

Event payloads (TypeScript):

```ts
type ResourceChannelEvent =
  | { type: "chat_room.created"; payload: ChatRoom }
  | { type: "notification.created"; payload: unknown };

type RoomChannelEvent =
  | { type: "message.created"; payload: ChatMessage }
  | { type: "read"; viewer: { type: string; id: number }; last_read_at: string };
```

## 4. File layout

```
src/
├── services/
│   ├── cable.ts                    ← generic ActionCable wrapper
│   └── chat/
│       └── cableChannels.ts        ← chat-specific channel helpers
├── store/redux/
│   ├── store.ts
│   └── services/
│       ├── api.ts                  ← RTK Query base (axios)
│       ├── api-types/chat.ts       ← types
│       └── api/
│           ├── chatRoomsApi.ts
│           └── chatMessagesApi.ts
└── utils/chat/
    ├── types.ts                    ← ChatIMessage (gifted-chat compatible)
    └── toIMessage.ts
```

---

## 5. The code

### `src/services/cable.ts` — ActionCable wrapper

Generic — not chat-specific. Reusable for any ActionCable channel.

```ts
import { ActionCable, Cable } from "@kesha-antonov/react-native-action-cable";

const CABLE_URL = process.env.EXPO_PUBLIC_CABLE_URL;

export type CableStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface CableSubscription<TMessage = unknown> {
  on(event: "message", handler: (data: TMessage) => void): void;
  send(data: { action?: string } & Record<string, unknown>): void;
  disconnect(): void;
}

export interface CableClient {
  subscribeTo<TMessage = unknown>(
    channel: string,
    params?: Record<string, unknown>,
  ): CableSubscription<TMessage>;
  disconnect(): void;
}

type ActiveSub = {
  key: string;
  channel: string;
  params?: Record<string, unknown>;
  handlers: ((data: unknown) => void)[];
  ch: ReturnType<InstanceType<typeof Cable>["setChannel"]> | null;
  refs: number;
};

type Consumer = ReturnType<typeof ActionCable.createConsumer>;

let actionCable: Consumer | null = null;
let cable: InstanceType<typeof Cable> | null = null;
let currentToken: string | null = null;
const activeSubs = new Map<string, ActiveSub>();

let status: CableStatus = "disconnected";
const statusListeners = new Set<(s: CableStatus) => void>();

function setStatus(next: CableStatus) {
  if (status === next) return;
  status = next;
  for (const l of statusListeners) l(status);
}

export function getCableStatus(): CableStatus {
  return status;
}

export function onCableStatus(listener: (s: CableStatus) => void): () => void {
  statusListeners.add(listener);
  listener(status);
  return () => {
    statusListeners.delete(listener);
  };
}

function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const body = keys
    .map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k]))
    .join(",");
  return "{" + body + "}";
}

function keyOf(channel: string, params?: Record<string, unknown>): string {
  return params ? `${channel}|${stableStringify(params)}` : channel;
}

function attach(sub: ActiveSub) {
  if (!cable || !actionCable || sub.ch) return;
  sub.ch = cable.setChannel(
    sub.channel,
    actionCable.subscriptions.create({ channel: sub.channel, ...sub.params }),
  );
  for (const handler of sub.handlers) {
    sub.ch.on("received", handler);
  }
}

type ConnectionEvents = {
  open: () => void;
  close: (e: unknown) => void;
};

function bindTransportStatus(consumer: Consumer) {
  const conn = (
    consumer as unknown as { connection: { events: ConnectionEvents } }
  ).connection;
  const origOpen = conn.events.open;
  const origClose = conn.events.close;
  conn.events.open = () => {
    origOpen();
    if (actionCable === consumer) setStatus("connected");
  };
  conn.events.close = (e) => {
    origClose(e);
    if (actionCable === consumer) setStatus("reconnecting");
  };
}

function openTransport(url: string) {
  actionCable = ActionCable.createConsumer(url);
  cable = new Cable({});
  bindTransportStatus(actionCable);
  setStatus("connecting");
  for (const sub of activeSubs.values()) attach(sub);
}

function closeTransport() {
  for (const sub of activeSubs.values()) {
    sub.ch?.unsubscribe();
    sub.ch = null;
  }
  actionCable?.disconnect();
  actionCable = null;
  cable = null;
  setStatus("disconnected");
}

const client: CableClient = {
  subscribeTo<TMessage = unknown>(
    channel: string,
    params?: Record<string, unknown>,
  ): CableSubscription<TMessage> {
    const key = keyOf(channel, params);
    let sub = activeSubs.get(key);
    if (!sub) {
      sub = { key, channel, params, handlers: [], ch: null, refs: 0 };
      activeSubs.set(key, sub);
      attach(sub);
    }
    sub.refs++;
    const owned: ((data: unknown) => void)[] = [];

    return {
      on(_event, handler) {
        const h = handler as (data: unknown) => void;
        owned.push(h);
        sub!.handlers.push(h);
        sub!.ch?.on("received", h);
      },
      send(data) {
        sub!.ch?.perform(data.action ?? "receive", data);
      },
      disconnect() {
        for (const h of owned) {
          const i = sub!.handlers.indexOf(h);
          if (i !== -1) sub!.handlers.splice(i, 1);
        }
        owned.length = 0;
        sub!.refs--;
        if (sub!.refs <= 0) {
          sub!.ch?.unsubscribe();
          sub!.ch = null;
          activeSubs.delete(sub!.key);
        }
      },
    };
  },
  disconnect() {
    closeTransport();
    activeSubs.clear();
    currentToken = null;
  },
};

export function getCable(token: string | null): CableClient | null {
  if (!token || !CABLE_URL) {
    client.disconnect();
    return null;
  }

  if (currentToken === token && actionCable && cable) return client;

  closeTransport();
  openTransport(`${CABLE_URL}?token=${encodeURIComponent(token)}`);
  currentToken = token;
  return client;
}
```

Key design points:
- **Singleton consumer.** One WebSocket per token. Token change → close + reopen.
- **Reference counting per subscription.** Two RTK Query caches subscribing to the same room share one underlying ActionCable subscription; the channel stays open until refs hit zero.
- **`onCableStatus()`** for UI status badges (connecting / connected / reconnecting).

### `src/services/chat/cableChannels.ts`

```ts
import { getCable, type CableSubscription } from "@/src/services/cable";
import type {
  RoomChannelEvent,
  ResourceChannelEvent,
} from "@/src/store/redux/services/api-types";

export function subscribeToResource(
  token: string | null,
): CableSubscription<ResourceChannelEvent> | null {
  const cable = getCable(token);
  if (!cable) return null;
  return cable.subscribeTo<ResourceChannelEvent>("ResourceChannel");
}

export function subscribeToChatRoom(
  token: string | null,
  roomId: number,
): CableSubscription<RoomChannelEvent> | null {
  const cable = getCable(token);
  if (!cable) return null;
  return cable.subscribeTo<RoomChannelEvent>("Chat::RoomChannel", {
    room_id: roomId,
  });
}
```

### `src/store/redux/services/api-types/chat.ts`

```ts
export interface ChatRoomInterlocutor {
  id: number;
  type: string;          // "User" | "Customer"
  name: string;
  avatar_url: string | null;
}

export interface ChatRoom {
  id: number;
  interlocutor: ChatRoomInterlocutor | null;
  unread_count: number;
  is_notify: boolean | null;
  last_activity_at: string;
  created_at: string;
}

export interface PaginationMeta {
  count: number;
  page: number;
  items: number;
  pages: number;
}

export type GetChatRoomsParams = { per_count?: number };

export interface GetChatRoomsResponse {
  rooms: ChatRoom[];
  pagination: PaginationMeta;
}

export interface ChatMessageImage {
  id: number;
  url: string;
  content_type: string;
  byte_size: number;
  blurhash: string | null;
}

export type ChatWidgetKind = "service_card" | "appointment_proposal";

export interface ChatWidget {
  id: number;
  kind: ChatWidgetKind;
  payload: Record<string, unknown>;
  created_at: string;
  widgetable: unknown;
}

export interface ChatMessage {
  id: number;
  body: string | null;
  owner: ChatRoomInterlocutor;
  chat_room_id: number;
  images: ChatMessageImage[];
  widget: ChatWidget | null;
  created_at: string;
}

export interface GetChatMessagesResponse {
  items: ChatMessage[];
  next_cursor: string | null;
}

export type ResourceChannelEvent =
  | { type: "chat_room.created"; payload: ChatRoom }
  | { type: "notification.created"; payload: unknown };

export type RoomChannelEvent =
  | { type: "message.created"; payload: ChatMessage }
  | {
      type: "read";
      viewer: { type: string; id: number };
      last_read_at: string;
    };
```

### `src/utils/chat/types.ts`

```ts
import type { IMessage } from "react-native-gifted-chat";
import type { ChatMessageImage, ChatWidget } from "@/src/store/redux/services/api-types";

export type ChatIMessage = IMessage & {
  chatRoomId?: number;
  images?: ChatMessageImage[];
  widget?: ChatWidget | null;
  reply_to?: ChatIMessage | null;
};
```

### `src/utils/chat/toIMessage.ts`

```ts
import type { ChatMessage } from "@/src/store/redux/services/api-types";
import type { ChatIMessage } from "./types";

export const toIMessage = (msg: ChatMessage): ChatIMessage => {
  const giftedOwnerId = `${msg.owner.type.toLowerCase()}_${msg.owner.id}`;
  const firstImage = msg.images?.[0];

  return {
    _id: msg.id,
    text: msg.body ?? "",
    createdAt: new Date(msg.created_at).getTime(),
    user: {
      _id: giftedOwnerId,
      name: msg.owner.name,
      avatar: msg.owner.avatar_url ?? undefined,
    },
    image: firstImage?.url,
    system: false,
    sent: true,
    pending: false,
    chatRoomId: msg.chat_room_id,
    images: msg.images,
    widget: msg.widget ?? null,
  };
};
```

### `src/store/redux/services/api/chatRoomsApi.ts`

```ts
import { api } from "../api";
import {
  subscribeToResource,
  subscribeToChatRoom,
} from "@/src/services/chat/cableChannels";
import type {
  GetChatRoomsParams,
  GetChatRoomsResponse,
  ChatRoom,
  RoomChannelEvent,
} from "@/src/store/redux/services/api-types";
import type { RootState } from "@/src/store/redux/store";

type RoomSub = ReturnType<typeof subscribeToChatRoom>;

export const chatRoomsApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getChatRooms: builder.query<GetChatRoomsResponse, GetChatRoomsParams | void>({
      query: (params) => ({
        url: "/chat/rooms",
        method: "GET",
        params: params ?? undefined,
      }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState },
      ) {
        const token = (getState() as RootState).auth.token;
        const resourceSub = subscribeToResource(token);
        if (!resourceSub) return;

        const roomSubs = new Map<number, RoomSub>();

        const subscribeRoom = (room: ChatRoom) => {
          if (roomSubs.has(room.id)) return;
          const sub = subscribeToChatRoom(token, room.id);
          roomSubs.set(room.id, sub);

          sub?.on("message", (data: RoomChannelEvent) => {
            if (data.type !== "message.created") return;

            const { user: authUser, resourceType } = (getState() as RootState).auth;
            const currentId =
              authUser && resourceType ? `${resourceType}_${authUser.id}` : null;
            const ownerId = `${data.payload.owner.type.toLowerCase()}_${data.payload.owner.id}`;
            if (ownerId === currentId) return;

            updateCachedData((draft) => {
              const r = draft.rooms.find((r) => r.id === room.id);
              if (!r) return;
              r.unread_count += 1;
              r.last_activity_at = data.payload.created_at;
              draft.rooms.sort((a, b) =>
                b.last_activity_at.localeCompare(a.last_activity_at),
              );
            });
          });
        };

        try {
          const { data } = await cacheDataLoaded;
          for (const room of data.rooms) subscribeRoom(room);

          resourceSub.on("message", (data) => {
            if (data.type !== "chat_room.created") return;

            updateCachedData((draft) => {
              const idx = draft.rooms.findIndex((r) => r.id === data.payload.id);
              if (idx !== -1) {
                draft.rooms[idx] = data.payload;
              } else {
                draft.rooms.unshift(data.payload);
              }
              draft.rooms.sort((a, b) =>
                b.last_activity_at.localeCompare(a.last_activity_at),
              );
            });

            subscribeRoom(data.payload);
          });
        } catch {
          /* cacheEntryRemoved fired before cacheDataLoaded */
        }

        await cacheEntryRemoved;
        resourceSub.disconnect();
        for (const sub of roomSubs.values()) sub?.disconnect();
        roomSubs.clear();
      },
    }),

    getChatRoom: builder.query<ChatRoom, { chatRoomId: number }>({
      query: ({ chatRoomId }) => ({
        url: `/chat/rooms/${chatRoomId}`,
        method: "GET",
      }),
    }),

    createChatRoom: builder.mutation<
      ChatRoom,
      { userId: number; customerId: number }
    >({
      query: ({ userId, customerId }) => ({
        url: "/chat/rooms",
        method: "POST",
        data: { user_id: userId, customer_id: customerId },
      }),
    }),

    markRoomRead: builder.mutation<void, { chatRoomId: number }>({
      query: ({ chatRoomId }) => ({
        url: `/chat/rooms/${chatRoomId}/read`,
        method: "PATCH",
      }),
      async onQueryStarted({ chatRoomId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          chatRoomsApi.util.updateQueryData("getChatRooms", undefined, (draft) => {
            const room = draft.rooms.find((r) => r.id === chatRoomId);
            if (room) room.unread_count = 0;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    updateMembership: builder.mutation<
      void,
      { chatRoomId: number; is_notify: boolean }
    >({
      query: ({ chatRoomId, is_notify }) => ({
        url: `/chat/rooms/${chatRoomId}/membership`,
        method: "PATCH",
        data: { is_notify },
      }),
      async onQueryStarted({ chatRoomId, is_notify }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          chatRoomsApi.util.updateQueryData("getChatRooms", undefined, (draft) => {
            const room = draft.rooms.find((r) => r.id === chatRoomId);
            if (room) room.is_notify = is_notify;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useGetChatRoomQuery,
  useCreateChatRoomMutation,
  useMarkRoomReadMutation,
  useUpdateMembershipMutation,
} = chatRoomsApi;
```

### `src/store/redux/services/api/chatMessagesApi.ts`

```ts
import { api } from "../api";
import { subscribeToChatRoom } from "@/src/services/chat/cableChannels";
import { toIMessage } from "@/src/utils/chat/toIMessage";
import type { ChatIMessage } from "@/src/utils/chat/types";
import type {
  ChatMessage,
  GetChatMessagesResponse,
} from "@/src/store/redux/services/api-types";
import type { RootState } from "@/src/store/redux/store";

const FEED_LIMIT = 30;

export interface ChatMessagesCache {
  messages: ChatIMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

const chatMessagesApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getChatMessages: builder.query<
      ChatMessagesCache,
      { chatRoomId: number; cursor?: string }
    >({
      query: ({ chatRoomId, cursor }) => ({
        url: `/chat/rooms/${chatRoomId}/feed`,
        method: "GET",
        params: { before: cursor, limit: FEED_LIMIT },
      }),
      transformResponse: (response: GetChatMessagesResponse): ChatMessagesCache => ({
        messages: response.items.map(toIMessage),
        nextCursor: response.next_cursor,
        hasMore: response.items.length === FEED_LIMIT,
      }),
      serializeQueryArgs: ({ queryArgs }) => ({ chatRoomId: queryArgs.chatRoomId }),
      merge: (currentCache, newItems, { arg }) => {
        if (!arg.cursor) return newItems;
        return {
          ...newItems,
          messages: [...currentCache.messages, ...newItems.messages],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(
        { chatRoomId },
        { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const token = (getState() as RootState).auth.token;
        const subscription = subscribeToChatRoom(token, chatRoomId);
        if (!subscription) return;

        try {
          await cacheDataLoaded;

          subscription.on("message", (data) => {
            const { user: authUser, resourceType } = (getState() as RootState).auth;
            const currentId =
              authUser && resourceType ? `${resourceType}_${authUser.id}` : null;

            if (data.type === "message.created") {
              const ownerId = `${data.payload.owner.type.toLowerCase()}_${data.payload.owner.id}`;
              if (ownerId === currentId) return;

              updateCachedData((draft) => {
                const msg = toIMessage(data.payload);
                if (!draft.messages.some((m) => m._id === msg._id)) {
                  draft.messages.unshift(msg);
                }
              });
              return;
            }

            if (data.type === "read") {
              const viewerId = `${data.viewer.type.toLowerCase()}_${data.viewer.id}`;
              if (viewerId === currentId) return;

              const readAt = new Date(data.last_read_at).getTime();
              updateCachedData((draft) => {
                for (const m of draft.messages) {
                  const ts =
                    m.createdAt instanceof Date
                      ? m.createdAt.getTime()
                      : m.createdAt;
                  if (m.user._id === currentId && ts <= readAt) {
                    m.received = true;
                  }
                }
              });
            }
          });
        } catch {
          /* cacheEntryRemoved fired before cacheDataLoaded */
        }

        await cacheEntryRemoved;
        subscription.disconnect();
      },
    }),

    createChatMessage: builder.mutation<
      ChatMessage,
      {
        chatRoomId: number;
        data: FormData | Record<string, unknown>;
        optimistic: ChatIMessage;
      }
    >({
      query: ({ chatRoomId, data }) => ({
        url: `/chat/rooms/${chatRoomId}/messages`,
        method: "POST",
        data,
      }),
      async onQueryStarted({ chatRoomId, optimistic }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          chatMessagesApi.util.updateQueryData(
            "getChatMessages",
            { chatRoomId },
            (draft) => {
              if (!draft.messages.some((m) => m._id === optimistic._id)) {
                draft.messages.unshift(optimistic);
              }
            },
          ),
        );

        try {
          const { data: result } = await queryFulfilled;
          dispatch(
            chatMessagesApi.util.updateQueryData(
              "getChatMessages",
              { chatRoomId },
              (draft) => {
                const idx = draft.messages.findIndex((m) => m._id === optimistic._id);
                if (idx !== -1) draft.messages[idx] = toIMessage(result);
              },
            ),
          );
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export { chatMessagesApi };

export const {
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useCreateChatMessageMutation,
} = chatMessagesApi;
```

---

## 6. Required from the host project

### Auth slice shape

The cache handlers read `state.auth`:
```ts
type AuthState = {
  token: string | null;
  user: { id: number } | null;
  resourceType: "user" | "customer" | null;  // matches backend resource type
};
```
Lowercase `resourceType` is used to compare with backend `owner.type` (`User` / `Customer`).

### RTK Query base (`api.ts`)

Any axios- or fetch-based base will work. Token must be injected from `state.auth.token`. Example signature:

```ts
export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({ baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL! }),
  tagTypes: [],
  endpoints: () => ({}),
});
```

`axiosBaseQuery` should attach `Authorization: Bearer <token>` from Redux.

### Store

```ts
import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/src/store/redux/services/api";
import authReducer from "@/src/store/redux/slices/authSlice";

export const store = configureStore({
  reducer: { auth: authReducer, [api.reducerPath]: api.reducer },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
```

---

## 7. Usage

### Rooms list

```tsx
const { data, isLoading } = useGetChatRoomsQuery();
const [markRead] = useMarkRoomReadMutation();
```

WS subscriptions to `ResourceChannel` + every room's `Chat::RoomChannel` start automatically when the query mounts and tear down on unmount.

### Room screen

```tsx
const { data, fetchMore } = useGetChatMessagesQuery({ chatRoomId });
const [createMessage] = useCreateChatMessageMutation();

const onSend = (text: string) => {
  const optimistic: ChatIMessage = {
    _id: `tmp_${Date.now()}`,
    text,
    createdAt: Date.now(),
    user: { _id: `${resourceType}_${userId}`, name: userName },
    pending: true,
    sent: false,
  };
  createMessage({
    chatRoomId,
    optimistic,
    data: { body: text },
  });
};
```

Pagination: call the query with `cursor: nextCursor` to load older messages.

### Read receipts

When the screen opens:
```tsx
useEffect(() => {
  markRead({ chatRoomId });
}, [chatRoomId]);
```

The other participant gets a WS `read` event → their `getChatMessages` cache updates `received: true` on their own messages with `createdAt <= last_read_at`. Render `received` in your message bubble (gifted-chat `renderTicks`).

### Connection status

```tsx
import { onCableStatus, getCableStatus } from "@/src/services/cable";

const [s, setS] = useState(getCableStatus());
useEffect(() => onCableStatus(setS), []);
// Render badge: "Подключение..." when s !== "connected"
```

---

## 8. Behavior notes

- **Echo filtering.** Both `message.created` and `read` events arrive for the actor too. Handlers filter by `currentId` so the actor doesn't double-count or trip its own optimistic state.
- **`/feed` does not return read state.** A cold load shows messages without `received`; the `read` flag only appears after a live `read` event arrives. If the backend exposes per-message read state, set it inside `toIMessage`.
- **Channel name as ActionCable key.** `cable.setChannel(channel, ...)` keys by name. If you ever subscribe to two `Chat::RoomChannel`s with different params concurrently, switch the key in `attach()` to `keyOf(channel, params)` — currently fine because rooms are visited one at a time.
- **JWT in `?token=`.** Logged in nginx access logs by default. Suppress query string for `/cable` in nginx if that's a concern.

---

## 9. Optional: Reactotron WS debugging

Useful to inspect WS frames during development.

```bash
npm i -D reactotron-react-native reactotron-redux
```

`src/services/reactotron.ts`:
```ts
import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

const reactotron = Reactotron.setAsyncStorageHandler!(AsyncStorage)
  .configure({ name: "App" })
  .useReactNative({ networking: { ignoreUrls: /symbolicate|generate_204/ } })
  .use(reactotronRedux())
  .connect();

reactotron.clear?.();
declare global { interface Console { tron: typeof reactotron } }
console.tron = reactotron;

export default reactotron;
```

In root layout:
```ts
if (__DEV__) require("@/src/services/reactotron");
```

Hook into store:
```ts
const enhancers: any[] = [];
if (__DEV__) {
  const r = require("@/src/services/reactotron").default;
  if (r.createEnhancer) enhancers.push(r.createEnhancer());
}
configureStore({ /* ... */, enhancers: (g) => g().concat(enhancers) });
```

Display WS frames from `cable.ts`:
```ts
// inside attach()
sub.ch.on("received", (d: unknown) =>
  console.tron?.display?.({ name: `WS ${sub.channel}`, value: d }));
// inside bindTransportStatus
conn.events.open = () => { console.tron?.display?.({ name: "WS OPEN", value: {} }); origOpen(); /* ... */ };
conn.events.close = (e) => { console.tron?.display?.({ name: "WS CLOSE", value: e, important: true }); origClose(e); /* ... */ };
```

Download the desktop app from https://github.com/infinitered/reactotron/releases. For physical devices set `host: "<your-LAN-IP>"` in `.configure({...})`.
