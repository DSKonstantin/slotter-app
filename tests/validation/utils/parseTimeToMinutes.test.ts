import { parseTimeToMinutes } from "@/src/validation/utils/parseTimeToMinutes";

describe("parseTimeToMinutes", () => {
  it("returns null for empty/undefined input", () => {
    expect(parseTimeToMinutes(undefined)).toBeNull();
    expect(parseTimeToMinutes("")).toBeNull();
  });

  it("parses valid HH:mm into minutes since midnight", () => {
    expect(parseTimeToMinutes("00:00")).toBe(0);
    expect(parseTimeToMinutes("09:30")).toBe(570);
    expect(parseTimeToMinutes("23:59")).toBe(1439);
  });

  it("rejects out-of-range hours", () => {
    expect(parseTimeToMinutes("24:00")).toBeNull();
    expect(parseTimeToMinutes("-1:00")).toBeNull();
  });

  it("rejects out-of-range minutes", () => {
    expect(parseTimeToMinutes("10:60")).toBeNull();
    expect(parseTimeToMinutes("10:-1")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(parseTimeToMinutes("abc")).toBeNull();
    expect(parseTimeToMinutes("10:ab")).toBeNull();
  });
});
