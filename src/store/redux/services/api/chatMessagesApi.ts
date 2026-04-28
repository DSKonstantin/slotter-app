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
      transformResponse: (
        response: GetChatMessagesResponse,
      ): ChatMessagesCache => ({
        messages: response.items.map(toIMessage),
        nextCursor: response.next_cursor,
        hasMore: response.items.length === FEED_LIMIT,
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
          // no-op: cacheEntryRemoved resolved before cacheDataLoaded
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
      async onQueryStarted(
        { chatRoomId, optimistic },
        { dispatch, queryFulfilled },
      ) {
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
                const idx = draft.messages.findIndex(
                  (m) => m._id === optimistic._id,
                );
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
