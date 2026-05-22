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
import { applyWithRollback } from "./utils/cacheUtils";

type RoomSub = ReturnType<typeof subscribeToChatRoom>;
type PagedRooms = { pages: { rooms: ChatRoom[] }[] };

const RECONCILE_INTERVAL_MS = 3000;

export const findRoomInPages = (
  draft: PagedRooms,
  id: number,
): ChatRoom | undefined => {
  for (const page of draft.pages) {
    const room = page.rooms.find((r) => r.id === id);
    if (room) return room;
  }
  return undefined;
};

export const removeRoomFromPages = (
  draft: PagedRooms,
  id: number,
): ChatRoom | undefined => {
  for (const page of draft.pages) {
    const idx = page.rooms.findIndex((r) => r.id === id);
    if (idx !== -1) {
      const [removed] = page.rooms.splice(idx, 1);
      return removed;
    }
  }
  return undefined;
};

export const chatRoomsApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getChatRooms: builder.infiniteQuery<
      GetChatRoomsResponse,
      Omit<GetChatRoomsParams, "page">,
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: "/chat/rooms",
        method: "GET",
        params: { ...queryArg, page: pageParam },
      }),
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
          const { page, pages } = lastPage.pagination;
          return page < pages ? page + 1 : undefined;
        },
      },
      async onCacheEntryAdded(
        arg,
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

            const { user: authUser, resourceType } = (getState() as RootState)
              .auth;
            const currentId =
              authUser && resourceType
                ? `${resourceType}_${authUser.id}`
                : null;
            const ownerId = `${data.payload.owner.type.toLowerCase()}_${data.payload.owner.id}`;
            const isOwn = ownerId === currentId;

            updateCachedData((draft) => {
              const movedRoom = removeRoomFromPages(draft, room.id);
              if (!movedRoom) return;
              if (!isOwn) movedRoom.unread_count += 1;
              movedRoom.last_activity_at = data.payload.created_at;
              movedRoom.last_message = {
                id: data.payload.id,
                body: data.payload.body,
                created_at: data.payload.created_at,
                owner: {
                  id: data.payload.owner.id,
                  type: data.payload.owner.type,
                  name: data.payload.owner.name,
                  avatar_url: data.payload.owner.avatar_url,
                },
              };
              draft.pages[0]?.rooms.unshift(movedRoom);
            });
          });
        };

        // Reconcile subscriptions with the current cache — picks up rooms
        // loaded via fetchNextPage (cacheDataLoaded only fires once on initial).
        const reconcile = () => {
          const cacheData = chatRoomsApi.endpoints.getChatRooms.select(arg)(
            getState() as RootState,
          ).data;
          if (!cacheData) return;
          for (const page of cacheData.pages) {
            for (const room of page.rooms) {
              subscribeRoom(room);
            }
          }
        };

        const reconcileInterval = setInterval(
          reconcile,
          RECONCILE_INTERVAL_MS,
        );

        try {
          const { data } = await cacheDataLoaded;

          for (const page of data.pages) {
            for (const room of page.rooms) {
              subscribeRoom(room);
            }
          }

          resourceSub.on("message", (event) => {
            if (event.type !== "chat_room.created") return;

            updateCachedData((draft) => {
              // Preserve local state (unread_count, is_notify) when overlapping
              const existing = removeRoomFromPages(draft, event.payload.id);
              const merged: ChatRoom = existing
                ? {
                    ...event.payload,
                    unread_count: existing.unread_count,
                    is_notify: existing.is_notify,
                  }
                : event.payload;
              draft.pages[0]?.rooms.unshift(merged);
            });

            subscribeRoom(event.payload);
          });
        } catch {
          // no-op: cacheEntryRemoved resolved before cacheDataLoaded
        }

        await cacheEntryRemoved;
        clearInterval(reconcileInterval);
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newRoom } = await queryFulfilled;
          dispatch(
            chatRoomsApi.util.updateQueryData(
              "getChatRooms",
              {},
              (draft) => {
                // Dedup: Pusher (chat_room.created) may have already added it
                if (findRoomInPages(draft, newRoom.id)) return;
                draft.pages[0]?.rooms.unshift(newRoom);
              },
            ),
          );
        } catch {
          // Mutation failed — nothing to patch
        }
      },
    }),

    markRoomRead: builder.mutation<void, { chatRoomId: number }>({
      query: ({ chatRoomId }) => ({
        url: `/chat/rooms/${chatRoomId}/read`,
        method: "PATCH",
      }),
      async onQueryStarted({ chatRoomId }, { dispatch, queryFulfilled }) {
        const patches = [
          dispatch(
            chatRoomsApi.util.updateQueryData("getChatRooms", {}, (draft) => {
              const room = findRoomInPages(draft, chatRoomId);
              if (room) room.unread_count = 0;
            }),
          ),
          dispatch(
            chatRoomsApi.util.updateQueryData(
              "getChatRoom",
              { chatRoomId },
              (draft) => {
                draft.unread_count = 0;
              },
            ),
          ),
        ];
        await applyWithRollback(patches, queryFulfilled);
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
      async onQueryStarted(
        { chatRoomId, is_notify },
        { dispatch, queryFulfilled },
      ) {
        const patches = [
          dispatch(
            chatRoomsApi.util.updateQueryData("getChatRooms", {}, (draft) => {
              const room = findRoomInPages(draft, chatRoomId);
              if (room) room.is_notify = is_notify;
            }),
          ),
          dispatch(
            chatRoomsApi.util.updateQueryData(
              "getChatRoom",
              { chatRoomId },
              (draft) => {
                draft.is_notify = is_notify;
              },
            ),
          ),
        ];
        await applyWithRollback(patches, queryFulfilled);
      },
    }),
  }),
});

export const {
  useGetChatRoomsInfiniteQuery,
  useGetChatRoomQuery,
  useCreateChatRoomMutation,
  useMarkRoomReadMutation,
  useUpdateMembershipMutation,
} = chatRoomsApi;
