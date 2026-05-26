import { api } from "../api";
import { subscribeToChatRoom } from "@/src/services/chat/cableChannels";
import { toIMessage } from "@/src/utils/chat/toIMessage";
import type { ChatIMessage } from "@/src/utils/chat/types";
import type {
  ChatMessage,
  GetChatMessagesResponse,
} from "@/src/store/redux/services/api-types";
import type { RootState } from "@/src/store/redux/store";
import { chatRoomsApi, removeRoomFromPages } from "./chatRoomsApi";

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
      transformResponse: (
        response: GetChatMessagesResponse,
      ): ChatMessagesCache => ({
        messages: response.items.map(toIMessage),
        nextCursor: response.next_cursor,
        hasMore: response.next_cursor !== null,
      }),
      serializeQueryArgs: ({ queryArgs }) => ({
        chatRoomId: queryArgs.chatRoomId,
      }),
      merge: (currentCache, newItems, { arg }) => {
        if (!arg.cursor) return newItems;
        return {
          ...newItems,
          messages: [...currentCache.messages, ...newItems.messages],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      keepUnusedDataFor: 300,
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
            const { user: authUser, resourceType } = (getState() as RootState)
              .auth;
            const currentId =
              authUser && resourceType
                ? `${resourceType}_${authUser.id}`
                : null;

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
                // Messages are sorted newest-first. Iterate forward; once we
                // find a message of ours older than readAt that's already
                // marked received, everything older is too — bail out.
                for (const m of draft.messages) {
                  if (m.user._id !== currentId) continue;
                  const ts =
                    m.createdAt instanceof Date
                      ? m.createdAt.getTime()
                      : m.createdAt;
                  if (ts > readAt) continue;
                  if (m.received) break;
                  m.received = true;
                }
              });
            }
          });
        } catch {
          // no-op: cacheEntryRemoved resolved before cacheDataLoaded
        }

        await cacheEntryRemoved;
        subscription.disconnect();
      },
    }),

    sendMessage: builder.mutation<
      ChatMessage,
      { chatRoomId: number; body: string }
    >({
      query: ({ chatRoomId, body }) => ({
        url: `/chat/rooms/${chatRoomId}/messages`,
        method: "POST",
        data: { body },
      }),
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
      async onQueryStarted(
        { chatRoomId, optimistic },
        { dispatch, queryFulfilled },
      ) {
        const patches = [
          dispatch(
            chatMessagesApi.util.updateQueryData(
              "getChatMessages",
              { chatRoomId },
              (draft) => {
                if (!draft.messages.some((m) => m._id === optimistic._id)) {
                  draft.messages.unshift(optimistic);
                }
              },
            ),
          ),
        ];

        try {
          const { data: result } = await queryFulfilled;
          dispatch(
            chatMessagesApi.util.updateQueryData(
              "getChatMessages",
              { chatRoomId },
              (draft) => {
                const idx = draft.messages.findIndex(
                  (m) => m._id === optimistic._id,
                );
                if (idx !== -1) draft.messages[idx] = toIMessage(result);
              },
            ),
          );

          // Promote the room in the rooms list with the new last_message —
          // don't wait for Pusher echo (avoids stale preview if user navigates
          // back immediately).
          dispatch(
            chatRoomsApi.util.updateQueryData(
              "getChatRooms",
              {},
              (draft) => {
                const room = removeRoomFromPages(draft, chatRoomId);
                if (!room) return;
                room.last_activity_at = result.created_at;
                room.last_message = {
                  id: result.id,
                  body: result.body,
                  created_at: result.created_at,
                  owner: {
                    id: result.owner.id,
                    type: result.owner.type,
                    name: result.owner.name,
                    avatar_url: result.owner.avatar_url,
                    avatar_blurhash: result.owner.avatar_blurhash,
                  },
                };
                draft.pages[0]?.rooms.unshift(room);
              },
            ),
          );
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),
  }),
});

export { chatMessagesApi };

export const {
  useGetChatMessagesQuery,
  useCreateChatMessageMutation,
  useSendMessageMutation,
} = chatMessagesApi;
