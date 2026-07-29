import { DayScheduleSchema } from "@/src/validation/schemas/daySchedule.schema";
import {
  isEndAfterStart,
  overlapsOther,
} from "@/src/validation/utils/timeRange";

describe("isEndAfterStart", () => {
  it("is permissive when either side is missing", () => {
    expect(isEndAfterStart(undefined, "10:00")).toBe(true);
    expect(isEndAfterStart("09:00", undefined)).toBe(true);
  });

  it("is true when end is strictly after start", () => {
    expect(isEndAfterStart("09:00", "10:00")).toBe(true);
  });

  it("is false when end equals or precedes start", () => {
    expect(isEndAfterStart("09:00", "09:00")).toBe(false);
    expect(isEndAfterStart("10:00", "09:00")).toBe(false);
  });

  it("is false when either side fails to parse", () => {
    expect(isEndAfterStart("bad", "10:00")).toBe(false);
  });
});

describe("overlapsOther", () => {
  const a = { start: "09:00", end: "10:00" };
  const b = { start: "09:30", end: "10:30" };
  const c = { start: "10:00", end: "11:00" };

  it("detects an overlapping range in the list", () => {
    expect(overlapsOther(a, [a, b])).toBe(true);
  });

  it("does not flag back-to-back ranges as overlapping", () => {
    expect(overlapsOther(a, [a, c])).toBe(false);
  });

  it("excludes the current item from the comparison by reference", () => {
    expect(overlapsOther(a, [a])).toBe(false);
  });

  it("is false when the current item itself doesn't parse", () => {
    expect(overlapsOther({ start: "bad", end: "10:00" }, [b])).toBe(false);
  });
});

describe("DayScheduleSchema (integration: withEndAfterStart + breaksField wiring)", () => {
  const validDay = {
    isActive: true,
    date: "2026-07-22",
    startAt: "09:00",
    endAt: "18:00",
    breaks: [] as { start: string; end: string }[],
  };

  it("accepts a day with no breaks", () => {
    expect(DayScheduleSchema.isValidSync(validDay)).toBe(true);
  });

  it("rejects endAt at or before startAt", () => {
    expect(DayScheduleSchema.isValidSync({ ...validDay, endAt: "09:00" })).toBe(
      false,
    );
    expect(DayScheduleSchema.isValidSync({ ...validDay, endAt: "08:00" })).toBe(
      false,
    );
  });

  it("accepts non-overlapping breaks within the working day", () => {
    expect(
      DayScheduleSchema.isValidSync({
        ...validDay,
        breaks: [
          { start: "12:00", end: "12:30" },
          { start: "15:00", end: "15:15" },
        ],
      }),
    ).toBe(true);
  });

  it("rejects a break that falls outside the working day", () => {
    expect(
      DayScheduleSchema.isValidSync({
        ...validDay,
        breaks: [{ start: "08:00", end: "08:30" }],
      }),
    ).toBe(false);
  });

  it("rejects two overlapping breaks", () => {
    expect(
      DayScheduleSchema.isValidSync({
        ...validDay,
        breaks: [
          { start: "12:00", end: "13:00" },
          { start: "12:30", end: "13:30" },
        ],
      }),
    ).toBe(false);
  });
});
