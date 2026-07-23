import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { renderHook, waitFor, act } from "@testing-library/react-native";

import { api } from "@/src/store/redux/services/api";
import { useWorkingDaysCalendar } from "@/src/hooks/useWorkingDaysCalendar";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { upsertApiQueryData } from "@/tests/testUtils/upsertApiQueryData";
import type { WorkingDay } from "@/src/store/redux/services/api-types";

jest.mock("@/src/store/redux/services/axios", () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.reject(new Error("network disabled in tests")),
  ),
}));

const MONTH_START = formatApiDate(new Date(2026, 6, 1));
const MONTH_END = formatApiDate(new Date(2026, 6, 31));
const ACTIVE_DAY = formatApiDate(new Date(2026, 6, 10));
const INACTIVE_DAY = formatApiDate(new Date(2026, 6, 11));
const ABSENT_DAY = formatApiDate(new Date(2026, 6, 12));

const buildStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

const renderWithStore = (
  store: ReturnType<typeof buildStore>,
  userId?: number,
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useWorkingDaysCalendar(userId, "2026-07-15"), {
    wrapper,
  });
};

describe("useWorkingDaysCalendar", () => {
  it("is inert with no userId: nothing marked, always 'working', no minDate", async () => {
    const { result } = await renderWithStore(buildStore(), undefined);
    expect(result.current.markedDates).toEqual({});
    expect(result.current.isLoading).toBe(false);
    expect(result.current.minDate).toBeUndefined();
    expect(result.current.getDayStatus(ACTIVE_DAY)).toBe("working");
  });

  it("marks active days as enabled and inactive days as disabled", async () => {
    const store = buildStore();
    store.dispatch(
      upsertApiQueryData(
        "getWorkingDays",
        { userId: 1, date_from: MONTH_START, date_to: MONTH_END },
        {
          [ACTIVE_DAY]: { id: 5, is_active: true } as WorkingDay,
          [INACTIVE_DAY]: { id: 6, is_active: false } as WorkingDay,
        },
      ),
    );

    const { result } = await renderWithStore(store, 1);

    await waitFor(() =>
      expect(Object.keys(result.current.markedDates).length).toBeGreaterThan(0),
    );
    expect(result.current.markedDates[ACTIVE_DAY]).toEqual({});
    expect(result.current.markedDates[INACTIVE_DAY]).toEqual({
      disabled: true,
    });
  });

  it("getDayStatus distinguishes working/inactive/absent", async () => {
    const store = buildStore();
    store.dispatch(
      upsertApiQueryData(
        "getWorkingDays",
        { userId: 1, date_from: MONTH_START, date_to: MONTH_END },
        {
          [ACTIVE_DAY]: { id: 5, is_active: true } as WorkingDay,
          [INACTIVE_DAY]: { id: 6, is_active: false } as WorkingDay,
        },
      ),
    );

    const { result } = await renderWithStore(store, 1);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.getDayStatus(ACTIVE_DAY)).toBe("working");
    expect(result.current.getDayStatus(INACTIVE_DAY)).toBe("inactive");
    expect(result.current.getDayStatus(ABSENT_DAY)).toBe("absent");
    expect(result.current.getWorkingDayId(ACTIVE_DAY)).toBe(5);
    expect(result.current.getWorkingDayId(ABSENT_DAY)).toBeUndefined();
  });

  it("minDate is today's date only when a userId is present", async () => {
    const { result } = await renderWithStore(buildStore(), 1);
    expect(result.current.minDate).toBe(formatApiDate(new Date()));
  });

  it("onMonthChange re-points the query at the new month without crashing", async () => {
    const { result } = await renderWithStore(buildStore(), 1);

    await act(async () => {
      result.current.onMonthChange({ year: 2026, month: 8 });
    });

    expect(result.current.markedDates).toEqual({});
  });
});
