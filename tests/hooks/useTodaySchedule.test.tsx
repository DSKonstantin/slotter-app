import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { renderHook, waitFor } from "@testing-library/react-native";

import authReducer, {
  type AuthState,
} from "@/src/store/redux/slices/authSlice";
import { api } from "@/src/store/redux/services/api";
import { useTodaySchedule } from "@/src/hooks/useTodaySchedule";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { upsertApiQueryData } from "@/tests/testUtils/upsertApiQueryData";
import type { User, WorkingDay } from "@/src/store/redux/services/api-types";

jest.mock("@/src/store/redux/services/axios", () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.reject(new Error("network disabled in tests")),
  ),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

const TODAY_ISO = formatApiDate(new Date());

const buildStore = (loggedIn: boolean) => {
  const authState: AuthState = {
    token: loggedIn ? "token" : null,
    user: loggedIn ? ({ id: 1 } as User) : null,
    resourceType: loggedIn ? "user" : null,
    status: loggedIn ? "authenticated" : "unauthenticated",
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

const renderWithStore = (store: ReturnType<typeof buildStore>) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useTodaySchedule(), { wrapper });
};

describe("useTodaySchedule", () => {
  it("isn't ready and has no working day while there is no logged-in user (query skipped)", async () => {
    const { result } = await renderWithStore(buildStore(false));
    expect(result.current.isReady).toBe(false);
    expect(result.current.hasTodayWorkingDay).toBe(false);
    expect(result.current.todayISO).toBe(TODAY_ISO);
  });

  it("reports no working day today once data loads and today isn't in it", async () => {
    const store = buildStore(true);
    store.dispatch(
      upsertApiQueryData(
        "getWorkingDays",
        { userId: 1, date_from: TODAY_ISO, date_to: TODAY_ISO },
        {},
      ),
    );
    const { result } = await renderWithStore(store);

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.hasTodayWorkingDay).toBe(false);
    expect(result.current.isTodayDayOff).toBe(false);
  });

  it("reports an active working day today", async () => {
    const store = buildStore(true);
    store.dispatch(
      upsertApiQueryData(
        "getWorkingDays",
        { userId: 1, date_from: TODAY_ISO, date_to: TODAY_ISO },
        { [TODAY_ISO]: { is_active: true } as WorkingDay },
      ),
    );
    const { result } = await renderWithStore(store);

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.hasTodayWorkingDay).toBe(true);
    expect(result.current.isTodayDayOff).toBe(false);
  });

  it("reports today as a day off when the working day exists but is inactive", async () => {
    const store = buildStore(true);
    store.dispatch(
      upsertApiQueryData(
        "getWorkingDays",
        { userId: 1, date_from: TODAY_ISO, date_to: TODAY_ISO },
        { [TODAY_ISO]: { is_active: false } as WorkingDay },
      ),
    );
    const { result } = await renderWithStore(store);

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.hasTodayWorkingDay).toBe(true);
    expect(result.current.isTodayDayOff).toBe(true);
  });
});
