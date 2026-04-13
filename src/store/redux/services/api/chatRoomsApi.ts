import { api } from "../api";
import type {
  ChatRoom,
  GetChatRoomsParams,
  GetChatRoomsResponse,
} from "@/src/store/redux/services/api-types";

const chatRoomsApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getChatRooms: builder.query<GetChatRoomsResponse, GetChatRoomsParams | void>({
      query: (params) => ({
        url: "/chat_rooms",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: ["ChatRooms"],
    }),

    getChatRoom: builder.query<{ chat_room: ChatRoom }, { chatRoomId: number }>({
      query: ({ chatRoomId }) => ({
        url: `/chat_rooms/${chatRoomId}`,
        method: "GET",
      }),
      providesTags: ["ChatRooms"],
    }),

    createChatRoom: builder.mutation<{ chat_room: ChatRoom }, { memberId: number }>({
      query: ({ memberId }) => ({
        url: "/chat_rooms",
        method: "POST",
        data: { member_id: memberId },
      }),
      invalidatesTags: ["ChatRooms"],
    }),

    deleteChatRoom: builder.mutation<void, { chatRoomId: number }>({
      query: ({ chatRoomId }) => ({
        url: `/chat_rooms/${chatRoomId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatRooms"],
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useGetChatRoomQuery,
  useCreateChatRoomMutation,
  useDeleteChatRoomMutation,
} = chatRoomsApi;
