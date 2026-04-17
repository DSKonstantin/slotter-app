import { api } from "../api";
import { getCable } from "@/src/services/cable";
import { toIMessage } from "@/src/utils/chat/toIMessage";
import type { ChatIMessage } from "@/src/utils/chat/types";
import type {
  ChatMessage,
  GetChatMessagesResponse,
} from "@/src/store/redux/services/api-types";
import type { RootState } from "@/src/store/redux/store";

const TYPING_TIMEOUT_MS = 5_000;

type EventUser = { id: number; resource_type: string };

type RoomEvent =
  | { event: "message_created"; chat_message: ChatMessage }
  | { event: "message_updated"; chat_message: ChatMessage }
  | { event: "message_destroyed"; message_id: number; user: EventUser }
  | { event: "messages_read"; user: EventUser }
  | { event: "typing"; user: EventUser };

function toUserId(u: EventUser): string {
  return `${u.resource_type}_${u.id}`;
}

function getCurrentGiftedId(state: RootState): string | null {
  const { user, resourceType } = state.auth;
  return user && resourceType ? `${resourceType}_${user.id}` : null;
}

interface ChatMessagesCache {
  messages: ChatIMessage[];
  totalCount: number;
  unreadMessagesCount: number;
  page: number;
  hasMore: boolean;
}

const PAGE_SIZE = 30;

const chatMessagesApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getChatMessages: builder.query<
      ChatMessagesCache,
      { chatRoomId: number; page?: number }
    >({
      query: ({ chatRoomId, page = 1 }) => ({
        url: `/chat_rooms/${chatRoomId}/chat_messages`,
        method: "GET",
        params: { page },
      }),
      transformResponse: (
        response: GetChatMessagesResponse,
        _meta,
        arg,
      ): ChatMessagesCache => ({
        messages: response.chat_messages.map(toIMessage),
        totalCount: response.total_count,
        unreadMessagesCount: response.unread_messages_count,
        page: arg.page ?? 1,
        hasMore: response.chat_messages.length === PAGE_SIZE,
      }),
      serializeQueryArgs: ({ queryArgs }) => ({
        chatRoomId: queryArgs.chatRoomId,
      }),
      merge: (currentCache, newItems) => {
        if (newItems.page === 1) return newItems;
        return {
          ...newItems,
          messages: [...currentCache.messages, ...newItems.messages],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(
        { chatRoomId },
        {
          dispatch,
          getState,
          updateCachedData,
          cacheDataLoaded,
          cacheEntryRemoved,
        },
      ) {
        const token = (getState() as RootState).auth.token;
        const cable = getCable(token);
        if (!cable) return;

        const subscription = cable.subscribeTo("Chat::RoomChannel", {
          room_id: chatRoomId,
        });
        let typingTimer: ReturnType<typeof setTimeout> | null = null;

        try {
          await cacheDataLoaded;

          subscription.on("message", (raw: unknown) => {
            const data = raw as RoomEvent;
            const currentId = getCurrentGiftedId(getState() as RootState);
            const isMe = (id: string) => id === currentId;

            switch (data.event) {
              case "message_created": {
                if (!isMe(toUserId(data.chat_message.user))) {
                  updateCachedData((draft) => {
                    const msg = toIMessage(data.chat_message);
                    if (!draft.messages.some((m) => m._id === msg._id)) {
                      draft.messages.unshift(msg);
                    }
                  });
                }
                break;
              }
              case "message_updated": {
                if (!isMe(toUserId(data.chat_message.user))) {
                  updateCachedData((draft) => {
                    const msg = toIMessage(data.chat_message);
                    const idx = draft.messages.findIndex(
                      (m) => m._id === msg._id,
                    );
                    if (idx !== -1) draft.messages[idx] = msg;
                  });
                }
                break;
              }
              case "message_destroyed": {
                if (!isMe(toUserId(data.user))) {
                  updateCachedData((draft) => {
                    draft.messages = draft.messages.filter(
                      (m) => m._id !== data.message_id,
                    );
                  });
                }
                break;
              }
              case "messages_read": {
                if (!isMe(toUserId(data.user))) {
                  updateCachedData((draft) => {
                    for (const m of draft.messages) {
                      if ((m as ChatIMessage).status !== "read") {
                        (m as ChatIMessage).status = "read";
                      }
                    }
                  });
                }
                break;
              }
              case "typing": {
                if (!isMe(toUserId(data.user))) {
                  dispatch(
                    chatMessagesApi.util.updateQueryData(
                      "getChatMessages",
                      { chatRoomId },
                      (draft) => {
                        (
                          draft as ChatMessagesCache & { _typing?: boolean }
                        )._typing = true;
                      },
                    ),
                  );
                  if (typingTimer) clearTimeout(typingTimer);
                  typingTimer = setTimeout(() => {
                    dispatch(
                      chatMessagesApi.util.updateQueryData(
                        "getChatMessages",
                        { chatRoomId },
                        (draft) => {
                          (
                            draft as ChatMessagesCache & { _typing?: boolean }
                          )._typing = false;
                        },
                      ),
                    );
                  }, TYPING_TIMEOUT_MS);
                }
                break;
              }
            }
          });
        } catch {
          // cacheEntryRemoved resolved before cacheDataLoaded
        }

        await cacheEntryRemoved;
        subscription.disconnect();
        if (typingTimer) clearTimeout(typingTimer);
      },
    }),

    createChatMessage: builder.mutation<
      { chat_message: ChatMessage; unread_messages_count: number },
      {
        chatRoomId: number;
        data: FormData | Record<string, unknown>;
        optimistic: ChatIMessage;
      }
    >({
      query: ({ chatRoomId, data }) => ({
        url: `/chat_rooms/${chatRoomId}/chat_messages`,
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
                if (idx !== -1) {
                  draft.messages[idx] = toIMessage(result.chat_message);
                }
              },
            ),
          );
        } catch {
          patch.undo();
        }
      },
    }),

    deleteChatMessage: builder.mutation<
      { success: boolean; unread_messages_count: number },
      { chatRoomId: number; messageId: number; rollback?: ChatIMessage }
    >({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chat_rooms/${chatRoomId}/chat_messages/${messageId}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { chatRoomId, messageId },
        { dispatch, queryFulfilled },
      ) {
        const patch = dispatch(
          chatMessagesApi.util.updateQueryData(
            "getChatMessages",
            { chatRoomId },
            (draft) => {
              draft.messages = draft.messages.filter(
                (m) => m._id !== messageId,
              );
            },
          ),
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

export { chatMessagesApi };
export type { ChatMessagesCache };

export const {
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useCreateChatMessageMutation,
  useDeleteChatMessageMutation,
} = chatMessagesApi;
