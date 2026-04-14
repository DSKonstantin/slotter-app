import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IMessage } from "react-native-gifted-chat";

interface RoomState {
  messages: IMessage[];
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
}

interface ChatState {
  rooms: Record<number, RoomState>;
  typing: Record<number, boolean>;
  replyingTo: Record<number, IMessage | null>;
}

const makeRoomState = (): RoomState => ({
  messages: [],
  page: 1,
  hasMore: true,
  loadingMore: false,
});

const initialState: ChatState = {
  rooms: {},
  typing: {},
  replyingTo: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    initRoom(state, { payload }: PayloadAction<{ roomId: number }>) {
      if (!state.rooms[payload.roomId]) {
        state.rooms[payload.roomId] = makeRoomState();
      }
    },

    setMessages(
      state,
      {
        payload,
      }: PayloadAction<{
        roomId: number;
        messages: IMessage[];
        page: number;
        hasMore: boolean;
      }>,
    ) {
      const { roomId, messages, page, hasMore } = payload;
      if (!state.rooms[roomId]) state.rooms[roomId] = makeRoomState();

      state.rooms[roomId].messages =
        page === 1 ? messages : [...state.rooms[roomId].messages, ...messages];
      state.rooms[roomId].page = page;
      state.rooms[roomId].hasMore = hasMore;
      state.rooms[roomId].loadingMore = false;
    },

    pushMessage(
      state,
      { payload }: PayloadAction<{ roomId: number; message: IMessage }>,
    ) {
      const { roomId, message } = payload;
      if (!state.rooms[roomId]) state.rooms[roomId] = makeRoomState();
      const exists = state.rooms[roomId].messages.some(
        (m) => m._id === message._id,
      );
      if (!exists) {
        state.rooms[roomId].messages = [
          message,
          ...state.rooms[roomId].messages,
        ];
      }
    },

    updateMessage(
      state,
      {
        payload,
      }: PayloadAction<{
        roomId: number;
        tempId: string | number;
        message: IMessage;
      }>,
    ) {
      const room = state.rooms[payload.roomId];
      if (!room) return;
      const idx = room.messages.findIndex((m) => m._id === payload.tempId);
      if (idx !== -1) room.messages[idx] = payload.message;
    },

    removeMessage(
      state,
      {
        payload,
      }: PayloadAction<{ roomId: number; messageId: string | number }>,
    ) {
      const room = state.rooms[payload.roomId];
      if (!room) return;
      room.messages = room.messages.filter((m) => m._id !== payload.messageId);
    },

    setLoadingMore(
      state,
      { payload }: PayloadAction<{ roomId: number; loading: boolean }>,
    ) {
      const room = state.rooms[payload.roomId];
      if (room) room.loadingMore = payload.loading;
    },

    setTyping(
      state,
      { payload }: PayloadAction<{ roomId: number; isTyping: boolean }>,
    ) {
      state.typing[payload.roomId] = payload.isTyping;
    },

    setReplyingTo(
      state,
      { payload }: PayloadAction<{ roomId: number; message: IMessage | null }>,
    ) {
      state.replyingTo[payload.roomId] = payload.message;
    },

    reset: () => initialState,
  },
});

export const chatActions = chatSlice.actions;
export default chatSlice.reducer;
