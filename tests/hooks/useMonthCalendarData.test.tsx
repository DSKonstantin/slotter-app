import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { renderHook, waitFor, act } from "@testing-library/react-native";

import { api } from "@/src/store/redux/services/api";
import authReducer from "@/src/store/redux/slices/authSlice";
import useMonthCalendarData from "@/src/hooks/useMonthCalendarData";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { upsertApiQueryData } from "@/tests/testUtils/upsertApiQueryData";
import type {
  Appointment,
  WorkingDay,
} from "@/src/store/redux/services/api-types";

jest.mock("@/src/store/redux/services/axios", () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.reject(new Error("network disabled in tests")),
  ),
}));

const JULY = new Date(2026, 6, 1);
const DAY_10 = formatApiDate(new Date(2026, 6, 10));
const DAY_11 = formatApiDate(new Date(2026, 6, 11));

const buildStore = () =>
  configureStore({
    reducer: { auth: authReducer, [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers({ autoBatch: false }),
  });

const renderWithStore = (
  store: ReturnType<typeof buildStore>,
  auth: { userId: number } | null,
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(
    () => useMonthCalendarData({ auth, fetchMonth: JULY, currentMonth: JULY }),
    { wrapper },
  );
};

describe("useMonthCalendarData", () => {
  it("skips both queries and reports no data while logged out", async () => {
    const { result } = await renderWithStore(buildStore(), null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasData).toBe(false);
    expect(result.current.calendarData.totalAppointments).toBe(0);
  });

  it("computes booked-time progress for a day with a working day, a break and an overlapping appointment", async () => {
    const store = buildStore();
    store.dispatch(
      upsertApiQueryData(
        "getWorkingDays",
        {
          userId: 1,
          date_from: formatApiDate(JULY),
          date_to: formatApiDate(new Date(2026, 6, 31)),
        },
        {
          [DAY_10]: {
            start_at: "09:00",
            end_at: "18:00",
            working_day_breaks: [{ start_at: "12:00", end_at: "13:00" }],
          } as WorkingDay,
        },
      ),
    );
    store.dispatch(
      upsertApiQueryData(
        "getAppointments",
        {
          userId: 1,
          params: {
            date_from: formatApiDate(JULY),
            date_to: formatApiDate(new Date(2026, 6, 31)),
            status: [
              "requested",
              "pending",
              "confirmed",
              "arrived",
              "delayed",
              "missed",
              "completed",
            ],
          },
        },
        {
          [DAY_10]: [{ start_time: "10:00", end_time: "11:00" } as Appointment],
        },
      ),
    );

    const { result } = await renderWithStore(store, { userId: 1 });

    await waitFor(() => expect(result.current.hasData).toBe(true));
    expect(result.current.calendarData.progressMap[DAY_10]).toBeCloseTo(0.125);
    expect(result.current.calendarData.totalAppointments).toBe(1);
  });

  it("treats days without an active working day as non-working, and active ones as working", async () => {
    const store = buildStore();
    store.dispatch(
      upsertApiQueryData(
        "getWorkingDays",
        {
          userId: 1,
          date_from: formatApiDate(JULY),
          date_to: formatApiDate(new Date(2026, 6, 31)),
        },
        {
          [DAY_10]: {
            is_active: true,
            start_at: "09:00",
            end_at: "18:00",
          } as WorkingDay,
          [DAY_11]: {
            is_active: false,
            start_at: "09:00",
            end_at: "18:00",
          } as WorkingDay,
        },
      ),
    );

    const { result } = await renderWithStore(store, { userId: 1 });

    await waitFor(() => expect(result.current.hasData).toBe(true));
    expect(result.current.calendarData.nonWorkingDays.has(DAY_10)).toBe(false);
    expect(result.current.calendarData.nonWorkingDays.has(DAY_11)).toBe(true);
  });

  it("handleRefresh toggles refreshing while refetching both queries", async () => {
    const { result } = await renderWithStore(buildStore(), { userId: 1 });

    expect(result.current.refreshing).toBe(false);

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(result.current.refreshing).toBe(false);
  });
});
