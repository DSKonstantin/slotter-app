import {
  formatApiDate,
  formatDayMonthLong,
  formatDayNumber,
  formatMessageTime,
  formatMonthYear,
  formatShortDayName,
  formatSlotDate,
  isCurrentDay,
  subMonths,
} from "@/src/utils/date/formatDate";

const WEDNESDAY = new Date(2026, 6, 22); // 2026-07-22

describe("formatApiDate / formatSlotDate", () => {
  it("format with the expected separators and order", () => {
    expect(formatApiDate(WEDNESDAY)).toBe("2026-07-22");
    expect(formatSlotDate(WEDNESDAY)).toBe("22-07-2026");
  });
});

describe("formatDayNumber", () => {
  it("returns the day of month without leading zero", () => {
    expect(formatDayNumber(new Date(2026, 6, 5))).toBe("5");
  });
});

describe("ru-localized formatters", () => {
  it("formatMonthYear", () => {
    expect(formatMonthYear(WEDNESDAY)).toBe("июль 2026");
  });

  it("formatDayMonthLong", () => {
    expect(formatDayMonthLong(WEDNESDAY)).toBe("22 июля");
  });

  it("formatShortDayName", () => {
    expect(formatShortDayName(WEDNESDAY)).toBe("ср");
  });
});

describe("subMonths", () => {
  it("subtracts whole months without mutating the input date", () => {
    const result = subMonths(WEDNESDAY, 2);
    expect(result.getMonth()).toBe(4); // May (0-indexed)
    expect(WEDNESDAY.getMonth()).toBe(6); // original untouched
  });
});

describe("isCurrentDay", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(WEDNESDAY);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("is false for a falsy input", () => {
    expect(isCurrentDay(null)).toBe(false);
    expect(isCurrentDay(undefined)).toBe(false);
  });

  it("is true when the date string is today", () => {
    expect(isCurrentDay("2026-07-22")).toBe(true);
  });

  it("is false for any other day", () => {
    expect(isCurrentDay("2026-07-21")).toBe(false);
  });
});

describe("formatMessageTime", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 22, 15, 30));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows just the time for a message sent today", () => {
    expect(formatMessageTime(new Date(2026, 6, 22, 9, 5).toISOString())).toBe(
      "09:05",
    );
  });

  it("shows 'Вчера' for a message sent yesterday", () => {
    expect(formatMessageTime(new Date(2026, 6, 21, 9, 5).toISOString())).toBe(
      "Вчера",
    );
  });

  it("shows the short date for anything older", () => {
    expect(formatMessageTime(new Date(2026, 6, 10, 9, 5).toISOString())).toBe(
      "10 июл.",
    );
  });
});
