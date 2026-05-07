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
    getChatRooms: builder.query<
      GetChatRoomsResponse,
      GetChatRoomsParams | void
    >({
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

            const { user: authUser, resourceType } = (getState() as RootState)
              .auth;
            const currentId =
              authUser && resourceType
                ? `${resourceType}_${authUser.id}`
                : null;
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

          for (const room of data.rooms) {
            subscribeRoom(room);
          }

          resourceSub.on("message", (data) => {
            if (data.type !== "chat_room.created") return;

            updateCachedData((draft) => {
              const idx = draft.rooms.findIndex(
                (r) => r.id === data.payload.id,
              );
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
          // no-op: cacheEntryRemoved resolved before cacheDataLoaded
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
          chatRoomsApi.util.updateQueryData(
            "getChatRooms",
            undefined,
            (draft) => {
              const room = draft.rooms.find((r) => r.id === chatRoomId);
              if (room) room.unread_count = 0;
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
        const patch = dispatch(
          chatRoomsApi.util.updateQueryData(
            "getChatRooms",
            undefined,
            (draft) => {
              const room = draft.rooms.find((r) => r.id === chatRoomId);
              if (room) room.is_notify = is_notify;
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

export const {
  useGetChatRoomsQuery,
  useGetChatRoomQuery,
  useCreateChatRoomMutation,
  useMarkRoomReadMutation,
  useUpdateMembershipMutation,
} = chatRoomsApi;
