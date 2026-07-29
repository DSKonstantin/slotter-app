import { getDatesUntilEndOfWeek } from "@/src/utils/schedule/getDatesUntilEndOfWeek";

describe("getDatesUntilEndOfWeek", () => {
  it("returns only today when today is Sunday", () => {
    const sunday = new Date(2026, 6, 26);
    const result = getDatesUntilEndOfWeek(sunday);
    expect(result).toHaveLength(1);
    expect(result[0].getDate()).toBe(26);
  });

  it("returns today through the coming Sunday for a mid-week date", () => {
    const wednesday = new Date(2026, 6, 22);
    const result = getDatesUntilEndOfWeek(wednesday);
    expect(result.map((d) => d.getDate())).toEqual([22, 23, 24, 25, 26]);
  });

  it("returns all 7 days when starting on Monday", () => {
    const monday = new Date(2026, 6, 20);
    const result = getDatesUntilEndOfWeek(monday);
    expect(result).toHaveLength(7);
    expect(result[0].getDate()).toBe(20);
    expect(result[6].getDate()).toBe(26);
  });
});
