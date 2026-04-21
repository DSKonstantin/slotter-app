import { api } from "../api";
import { getCable } from "@/src/services/cable";
import type {
  ChatRoom,
  GetChatRoomsParams,
  GetChatRoomsResponse,
} from "@/src/store/redux/services/api-types";
import type { RootState } from "@/src/store/redux/store";

type IndexEvent =
  | { event: "room_created"; chat_room: ChatRoom }
  | { event: "room_updated"; chat_room: ChatRoom };

export const chatRoomsApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getChatRooms: builder.query<
      GetChatRoomsResponse,
      GetChatRoomsParams | void
    >({
      query: (params) => ({
        url: "/chat_rooms",
        method: "GET",
        params: params ?? undefined,
      }),
      keepUnusedDataFor: Infinity,
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState },
      ) {
        const token = (getState() as RootState).auth.token;
        const cable = getCable(token);
        if (!cable) return;

        const subscription = cable.subscribeTo("Chat::RoomsChannel");

        try {
          await cacheDataLoaded;

          subscription.on("message", (raw: unknown) => {
            const data = raw as IndexEvent;
            if (
              data.event === "room_created" ||
              data.event === "room_updated"
            ) {
              updateCachedData((draft) => {
                const idx = draft.chat_rooms.findIndex(
                  (r) => r.id === data.chat_room.id,
                );
                if (idx !== -1) {
                  draft.chat_rooms[idx] = data.chat_room;
                } else {
                  draft.chat_rooms.unshift(data.chat_room);
                }
                draft.chat_rooms.sort((a, b) => {
                  const aDate = a.last_message?.created_at ?? a.created_at;
                  const bDate = b.last_message?.created_at ?? b.created_at;
                  return bDate.localeCompare(aDate);
                });
              });
            }
          });
        } catch {
          // cacheEntryRemoved resolved before cacheDataLoaded
        }

        await cacheEntryRemoved;
        subscription.disconnect();
      },
    }),

    getChatRoom: builder.query<
      {
        chat_room: ChatRoom & {
          other_member: ChatRoom["other_member"] & { phone?: string };
        };
      },
      { chatRoomId: number }
    >({
      query: ({ chatRoomId }) => ({
        url: `/chat_rooms/${chatRoomId}`,
        method: "GET",
      }),
    }),

    createChatRoom: builder.mutation<
      { chat_room: ChatRoom },
      { memberId: number }
    >({
      query: ({ memberId }) => ({
        url: "/chat_rooms",
        method: "POST",
        data: { member_id: memberId },
      }),
    }),

    deleteChatRoom: builder.mutation<void, { chatRoomId: number }>({
      query: ({ chatRoomId }) => ({
        url: `/chat_rooms/${chatRoomId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ chatRoomId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          chatRoomsApi.util.updateQueryData("getChatRooms", undefined, (draft) => {
            draft.chat_rooms = draft.chat_rooms.filter((r) => r.id !== chatRoomId);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    typingInRoom: builder.mutation<void, { chatRoomId: number }>({
      query: ({ chatRoomId }) => ({
        url: `/chat_rooms/${chatRoomId}/typing`,
        method: "POST",
      }),
    }),

    blockChatRoom: builder.mutation<void, { chatRoomId: number }>({
      query: ({ chatRoomId }) => ({
        url: `/chat_rooms/${chatRoomId}/block`,
        method: "POST",
      }),
      async onQueryStarted({ chatRoomId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          chatRoomsApi.util.updateQueryData("getChatRooms", undefined, (draft) => {
            const room = draft.chat_rooms.find((r) => r.id === chatRoomId);
            if (room) room.blocked_by_me = true;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    unblockChatRoom: builder.mutation<void, { chatRoomId: number }>({
      query: ({ chatRoomId }) => ({
        url: `/chat_rooms/${chatRoomId}/unblock`,
        method: "DELETE",
      }),
      async onQueryStarted({ chatRoomId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          chatRoomsApi.util.updateQueryData("getChatRooms", undefined, (draft) => {
            const room = draft.chat_rooms.find((r) => r.id === chatRoomId);
            if (room) room.blocked_by_me = false;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    muteChatRoom: builder.mutation<
      void,
      { chatRoomId: number; muted: boolean }
    >({
      query: ({ chatRoomId, muted }) => ({
        url: `/chat_rooms/${chatRoomId}/mute`,
        method: "POST",
        data: { muted },
      }),
      async onQueryStarted({ chatRoomId, muted }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          chatRoomsApi.util.updateQueryData("getChatRooms", undefined, (draft) => {
            const room = draft.chat_rooms.find((r) => r.id === chatRoomId);
            if (room) room.muted_by_me = muted;
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
  useDeleteChatRoomMutation,
  useTypingInRoomMutation,
  useBlockChatRoomMutation,
  useUnblockChatRoomMutation,
  useMuteChatRoomMutation,
} = chatRoomsApi;
