import {
  getOnlineWindows,
  getUnavailableRanges,
  subtractRanges,
  type BookingFixedTimeSettings,
} from "@/src/utils/bookingFixedTime";

const MONDAY = "2026-09-28";
const SUNDAY = "2026-09-27";

const settings = (
  overrides: Partial<BookingFixedTimeSettings> = {},
): BookingFixedTimeSettings => ({
  enabled: true,
  mode: "fixed",
  interval: 60,
  fixedTimes: [780, 1020],
  days: ["mon"],
  dayTimes: { mon: [600] },
  ...overrides,
});

describe("getOnlineWindows", () => {
  it("returns null when disabled", () => {
    expect(getOnlineWindows(settings({ enabled: false }), MONDAY)).toBeNull();
  });

  it("builds interval-long windows from fixed times", () => {
    expect(getOnlineWindows(settings(), SUNDAY)).toEqual([
      { start: 780, end: 840 },
      { start: 1020, end: 1080 },
    ]);
  });

  it("returns null when the fixed list is empty", () => {
    expect(getOnlineWindows(settings({ fixedTimes: [] }), MONDAY)).toBeNull();
  });

  it("uses the weekday's own times in weekly mode", () => {
    expect(
      getOnlineWindows(settings({ mode: "weekly", interval: 30 }), MONDAY),
    ).toEqual([{ start: 600, end: 630 }]);
  });

  it("closes the whole day when the weekday is not selected", () => {
    expect(getOnlineWindows(settings({ mode: "weekly" }), SUNDAY)).toEqual([]);
  });

  it("returns null when a selected weekday has no times", () => {
    expect(
      getOnlineWindows(settings({ mode: "weekly", dayTimes: {} }), MONDAY),
    ).toBeNull();
  });
});

describe("subtractRanges", () => {
  it("splits a range around a cut inside it", () => {
    expect(
      subtractRanges([{ start: 720, end: 1020 }], [{ start: 780, end: 840 }]),
    ).toEqual([
      { start: 720, end: 780 },
      { start: 840, end: 1020 },
    ]);
  });

  it("removes a range fully covered by a cut", () => {
    expect(
      subtractRanges([{ start: 780, end: 840 }], [{ start: 760, end: 900 }]),
    ).toEqual([]);
  });

  it("keeps ranges untouched by cuts", () => {
    expect(
      subtractRanges([{ start: 600, end: 660 }], [{ start: 700, end: 760 }]),
    ).toEqual([{ start: 600, end: 660 }]);
  });
});

describe("getUnavailableRanges", () => {
  it("marks free time outside the windows", () => {
    expect(
      getUnavailableRanges(
        [{ start: 720, end: 1080 }],
        [
          { start: 780, end: 840 },
          { start: 1020, end: 1080 },
        ],
      ),
    ).toEqual([
      { start: 720, end: 780 },
      { start: 840, end: 1020 },
    ]);
  });

  it("marks all free time when there are no windows", () => {
    expect(getUnavailableRanges([{ start: 600, end: 700 }], [])).toEqual([
      { start: 600, end: 700 },
    ]);
  });

  it("skips time before notBefore", () => {
    expect(getUnavailableRanges([{ start: 600, end: 900 }], [], 686)).toEqual([
      { start: 686, end: 900 },
    ]);
  });

  it("drops slivers shorter than 5 minutes", () => {
    expect(
      getUnavailableRanges(
        [{ start: 600, end: 900 }],
        [{ start: 603, end: 897 }],
      ),
    ).toEqual([]);
  });
});
