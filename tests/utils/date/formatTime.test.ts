import {
  combineDayTime,
  formatDuration,
  formatMinutes,
  formatTimeFromISO,
  parseTime,
} from "@/src/utils/date/formatTime";

describe("combineDayTime", () => {
  it("joins day and time with a literal T", () => {
    expect(combineDayTime("2026-07-22", "14:30")).toBe("2026-07-22T14:30");
  });
});

describe("formatMinutes", () => {
  it("pads hours and minutes to two digits", () => {
    expect(formatMinutes(0)).toBe("00:00");
    expect(formatMinutes(5)).toBe("00:05");
    expect(formatMinutes(9 * 60 + 5)).toBe("09:05");
  });

  it("wraps past 24h into the next day's hour count", () => {
    expect(formatMinutes(25 * 60)).toBe("25:00");
  });
});

describe("formatDuration", () => {
  it("shows only minutes when under an hour", () => {
    expect(formatDuration(45)).toBe("45 мин");
  });

  it("shows only hours when exactly on the hour", () => {
    expect(formatDuration(120)).toBe("2 ч");
  });

  it("shows hours and padded minutes otherwise", () => {
    expect(formatDuration(90)).toBe("1 ч 30 мин");
    expect(formatDuration(65)).toBe("1 ч 05 мин");
  });
});

describe("parseTime", () => {
  it("returns 0 for falsy input", () => {
    expect(parseTime(undefined)).toBe(0);
    expect(parseTime(null)).toBe(0);
    expect(parseTime("")).toBe(0);
  });

  it("parses a plain HH:mm string into minutes", () => {
    expect(parseTime("09:05")).toBe(9 * 60 + 5);
    expect(parseTime("23:59")).toBe(23 * 60 + 59);
  });

  it("parses the time out of an ISO datetime string", () => {
    expect(parseTime("2026-07-22T14:30:00")).toBe(14 * 60 + 30);
  });

  it("falls back to 0 when nothing matches", () => {
    expect(parseTime("not a time")).toBe(0);
  });
});

describe("formatTimeFromISO", () => {
  it("returns an empty string for falsy input", () => {
    expect(formatTimeFromISO("")).toBe("");
  });

  it("extracts HH:mm from an ISO datetime", () => {
    expect(formatTimeFromISO("2026-07-22T14:30:00")).toBe("14:30");
  });

  it("passes through a plain HH:mm string", () => {
    expect(formatTimeFromISO("14:30")).toBe("14:30");
  });
});
