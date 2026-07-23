import { isBirthdayToday } from "@/src/utils/date/isBirthdayToday";

describe("isBirthdayToday", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 22)); // 2026-07-22
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("is true when month and day match today, regardless of birth year", () => {
    expect(isBirthdayToday("1990-07-22")).toBe(true);
    expect(isBirthdayToday("2001-07-22")).toBe(true);
  });

  it("is false for a different day or month", () => {
    expect(isBirthdayToday("1990-07-21")).toBe(false);
    expect(isBirthdayToday("1990-08-22")).toBe(false);
  });

  it("handles the year-boundary case (Dec 31 vs Jan 1) correctly", () => {
    jest.setSystemTime(new Date(2026, 0, 1)); // Jan 1
    expect(isBirthdayToday("1990-01-01")).toBe(true);
    expect(isBirthdayToday("1990-12-31")).toBe(false);
  });
});
