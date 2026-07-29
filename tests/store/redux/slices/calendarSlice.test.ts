import reducer, {
  clearHighlightSlotId,
  setActiveStatuses,
  setFilterModalOpen,
  setHighlightSlotId,
  setMode,
  setScheduleIntent,
  setSelectedDay,
} from "@/src/store/redux/slices/calendarSlice";

describe("calendarSlice initial state", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 22));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("defaults selectedDay to today (yyyy-MM-dd) and mode to 'day'", () => {
    jest.resetModules();
    const freshReducer =
      require("@/src/store/redux/slices/calendarSlice").default;
    const state = freshReducer(undefined, { type: "@@INIT" });
    expect(state.mode).toBe("day");
    expect(state.selectedDay).toBe("2026-07-22");
  });

  it("excludes 'cancelled' from the default active statuses but includes the rest", () => {
    jest.resetModules();
    const freshReducer =
      require("@/src/store/redux/slices/calendarSlice").default;
    const state = freshReducer(undefined, { type: "@@INIT" });
    expect(state.activeStatuses).toContain("pending");
    expect(state.activeStatuses).toContain("confirmed");
    expect(state.activeStatuses).not.toContain("cancelled");
  });
});

describe("calendarSlice reducers", () => {
  const initialState = {
    mode: "day" as const,
    selectedDay: "2026-07-22",
    activeStatuses: ["pending" as const],
    scheduleIntent: null,
    isFilterModalOpen: false,
    highlightSlotId: null,
  };

  it("setMode / setSelectedDay / setActiveStatuses", () => {
    expect(reducer(initialState, setMode("month")).mode).toBe("month");
    expect(
      reducer(initialState, setSelectedDay("2026-08-01")).selectedDay,
    ).toBe("2026-08-01");
    expect(
      reducer(initialState, setActiveStatuses(["confirmed"])).activeStatuses,
    ).toEqual(["confirmed"]);
  });

  it("setScheduleIntent stores either variant or null", () => {
    expect(
      reducer(initialState, setScheduleIntent({ type: "openTemplate" }))
        .scheduleIntent,
    ).toEqual({ type: "openTemplate" });
    expect(
      reducer(
        initialState,
        setScheduleIntent({ type: "duplicateFrom", date: "2026-07-01" }),
      ).scheduleIntent,
    ).toEqual({ type: "duplicateFrom", date: "2026-07-01" });
    expect(
      reducer(initialState, setScheduleIntent(null)).scheduleIntent,
    ).toBeNull();
  });

  it("setFilterModalOpen toggles the modal flag", () => {
    expect(
      reducer(initialState, setFilterModalOpen(true)).isFilterModalOpen,
    ).toBe(true);
  });

  it("set/clear highlightSlotId", () => {
    expect(reducer(initialState, setHighlightSlotId(42)).highlightSlotId).toBe(
      42,
    );
    expect(
      reducer({ ...initialState, highlightSlotId: 42 }, clearHighlightSlotId())
        .highlightSlotId,
    ).toBeNull();
  });
});
