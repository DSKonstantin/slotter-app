import { addDays, format, subDays } from "date-fns";

import { buildRangeMarks } from "@/src/utils/date/calendarRangeMarks";
import { colors } from "@/src/styles/colors";

const iso = (d: Date) => format(d, "yyyy-MM-dd");

const solid = {
  selected: true,
  selectedColor: colors.primary.blue[500],
};

describe("buildRangeMarks", () => {
  it("returns nothing without a start", () => {
    expect(buildRangeMarks(null, null)).toEqual({});
    expect(buildRangeMarks(null, "2026-03-10")).toEqual({});
  });

  it("marks a lone start day", () => {
    expect(buildRangeMarks("2026-03-01", null)).toEqual({
      "2026-03-01": solid,
    });
  });

  it("treats end === start as a single day", () => {
    expect(buildRangeMarks("2026-03-01", "2026-03-01")).toEqual({
      "2026-03-01": solid,
    });
  });

  it("marks endpoints solid and the days between as a light span", () => {
    const marks = buildRangeMarks("2026-03-01", "2026-03-04");

    expect(marks["2026-03-01"]).toEqual(solid);
    expect(marks["2026-03-04"]).toEqual(solid);
    expect(marks["2026-03-02"]).toEqual({
      selected: true,
      selectedColor: colors.primary.blue[100],
      selectedTextColor: colors.neutral[900],
    });
    expect(marks["2026-03-03"]).toEqual({
      selected: true,
      selectedColor: colors.primary.blue[100],
      selectedTextColor: colors.neutral[900],
    });
  });

  it("does not add an in-between mark for adjacent endpoints", () => {
    const marks = buildRangeMarks("2026-03-01", "2026-03-02");
    expect(Object.keys(marks).sort()).toEqual(["2026-03-01", "2026-03-02"]);
  });

  it("highlights today's text when today falls inside the span", () => {
    const today = new Date();
    const marks = buildRangeMarks(
      iso(subDays(today, 1)),
      iso(addDays(today, 1)),
    );

    expect(marks[iso(today)]).toEqual({
      selected: true,
      selectedColor: colors.primary.blue[100],
      selectedTextColor: colors.primary.blue[500],
    });
  });
});
