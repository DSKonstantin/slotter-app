import { api } from "../api";
import type {
  ChatMessage,
  GetChatMessagesResponse,
} from "@/src/store/redux/services/api-types";

const chatMessagesApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getChatMessages: builder.query<
      GetChatMessagesResponse,
      { chatRoomId: number; page?: number }
    >({
      query: ({ chatRoomId, page = 1 }) => ({
        url: `/chat_rooms/${chatRoomId}/chat_messages`,
        method: "GET",
        params: { page },
      }),
      providesTags: ["ChatMessages"],
    }),

    createChatMessage: builder.mutation<
      { chat_message: ChatMessage; unread_messages_count: number },
      { chatRoomId: number; data: FormData }
    >({
      query: ({ chatRoomId, data }) => ({
        url: `/chat_rooms/${chatRoomId}/chat_messages`,
        method: "POST",
        data,
      }),
    }),

    deleteChatMessage: builder.mutation<
      { success: boolean; unread_messages_count: number },
      { chatRoomId: number; messageId: number }
    >({
      query: ({ chatRoomId, messageId }) => ({
        url: `/chat_rooms/${chatRoomId}/chat_messages/${messageId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useCreateChatMessageMutation,
  useDeleteChatMessageMutation,
} = chatMessagesApi;
