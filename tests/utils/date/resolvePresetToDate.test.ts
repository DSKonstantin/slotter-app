import { startOfDay } from "date-fns";
import { resolvePresetToDate } from "@/src/utils/date/resolvePresetToDate";

describe("resolvePresetToDate", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 23, 15, 30)); // 2026-07-23 15:30
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves "today" to the start of the current day', () => {
    expect(resolvePresetToDate("today")).toEqual(startOfDay(new Date()));
  });

  it('resolves "tomorrow" to the start of the next day', () => {
    expect(resolvePresetToDate("tomorrow")).toEqual(
      new Date(2026, 6, 24, 0, 0, 0, 0),
    );
  });

  it('resolves "after_tomorrow" to the start of the day after next', () => {
    expect(resolvePresetToDate("after_tomorrow")).toEqual(
      new Date(2026, 6, 25, 0, 0, 0, 0),
    );
  });

  it("falls back to today for an unknown preset", () => {
    expect(resolvePresetToDate("unknown")).toEqual(startOfDay(new Date()));
  });
});
