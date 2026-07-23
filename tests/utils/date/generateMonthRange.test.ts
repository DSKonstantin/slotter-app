import { generateMonthRange } from "@/src/utils/date/generateMonthRange";

describe("generateMonthRange", () => {
  it("returns every month between dateFrom and dateTo inclusive, plus the default 2 extra future months", () => {
    expect(generateMonthRange("2026-01-15", "2026-03-01")).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
    ]);
  });

  it("returns a single month when dateFrom and dateTo are in the same month and extraFutureMonths is 0", () => {
    expect(generateMonthRange("2026-07-01", "2026-07-20", 0)).toEqual([
      "2026-07",
    ]);
  });

  it("rolls over the year boundary correctly", () => {
    expect(generateMonthRange("2026-11-01", "2026-12-01", 2)).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
  });

  it("supports a negative extraFutureMonths to trim months off the end", () => {
    expect(generateMonthRange("2026-01-01", "2026-03-01", -1)).toEqual([
      "2026-01",
      "2026-02",
    ]);
  });
});
