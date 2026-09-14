import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { renderHook, waitFor } from "@testing-library/react-native";

import authReducer, {
  type AuthState,
} from "@/src/store/redux/slices/authSlice";
import { api } from "@/src/store/redux/services/api";
import { useHasUnreadChat } from "@/src/hooks/useHasUnreadChat";
import { upsertApiQueryData } from "@/tests/testUtils/upsertApiQueryData";
import type {
  ChatRoom,
  GetChatRoomsResponse,
} from "@/src/store/redux/services/api-types";

jest.mock("@/src/store/redux/services/axios", () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.reject(new Error("network disabled in tests")),
  ),
}));

jest.mock("@/src/services/chat/cableChannels", () => ({
  subscribeToResource: jest.fn(() => null),
  subscribeToChatRoom: jest.fn(() => null),
}));

const buildRoom = (id: number, unread_count: number): ChatRoom =>
  ({ id, unread_count }) as ChatRoom;

const buildRoomsPage = (rooms: ChatRoom[]): GetChatRoomsResponse => ({
  rooms,
  pagination: { count: rooms.length, page: 1, items: rooms.length, pages: 1 },
});

const buildStore = () => {
  const authState: AuthState = {
    token: null,
    user: null,
    resourceType: null,
    status: "unauthenticated",
  };
  return configureStore({
    reducer: { auth: authReducer, [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState: { auth: authState },
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers({ autoBatch: false }),
  });
};

const renderWithStore = async (store: ReturnType<typeof buildStore>) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useHasUnreadChat(), { wrapper });
};

describe("useHasUnreadChat", () => {
  it("is false when no rooms have unread messages", async () => {
    const store = buildStore();
    store.dispatch(
      upsertApiQueryData(
        "getChatRooms",
        {},
        {
          pages: [buildRoomsPage([buildRoom(1, 0), buildRoom(2, 0)])],
          pageParams: [1],
        },
      ),
    );
    const { result } = await renderWithStore(store);

    await waitFor(() => expect(result.current).toBe(false));
  });

  it("is true when at least one room has unread messages", async () => {
    const store = buildStore();
    store.dispatch(
      upsertApiQueryData(
        "getChatRooms",
        {},
        {
          pages: [buildRoomsPage([buildRoom(1, 0), buildRoom(2, 3)])],
          pageParams: [1],
        },
      ),
    );
    const { result } = await renderWithStore(store);

    await waitFor(() => expect(result.current).toBe(true));
  });

  it("is true when an unread room is on a later loaded page", async () => {
    const store = buildStore();
    store.dispatch(
      upsertApiQueryData(
        "getChatRooms",
        {},
        {
          pages: [
            buildRoomsPage([buildRoom(1, 0)]),
            buildRoomsPage([buildRoom(2, 1)]),
          ],
          pageParams: [1, 2],
        },
      ),
    );
    const { result } = await renderWithStore(store);

    await waitFor(() => expect(result.current).toBe(true));
  });

  it("is false before any data has loaded", async () => {
    const { result } = await renderWithStore(buildStore());
    expect(result.current).toBe(false);
  });
});
