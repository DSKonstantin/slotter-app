import {
  buildGrid,
  buildGridItems,
  FALLBACK_RANGE,
  getDayRange,
  getDaySource,
  getTemplateRanges,
  getWorkingRanges,
} from "@/src/components/app/account/bookingFixedTime/utils";
import type { WorkingDay } from "@/src/store/redux/services/api-types";

const wd = (day: string, start: string, end: string): WorkingDay => ({
  id: 1,
  user_id: 1,
  day,
  start_at: `2000-01-01T${start}:00.000+03:00`,
  end_at: `2000-01-01T${end}:00.000+03:00`,
  is_active: true,
});

describe("buildGrid", () => {
  it("stops so that time + interval fits the day", () => {
    expect(buildGrid(30, { start: 600, end: 720 })).toEqual([
      600, 630, 660, 690,
    ]);
  });

  it("aligns the first time to the interval from midnight", () => {
    expect(buildGrid(60, { start: 570, end: 780 })).toEqual([600, 660, 720]);
  });
});

describe("buildGridItems", () => {
  it("appends selected times outside the schedule as muted", () => {
    const items = buildGridItems(60, { start: 600, end: 720 }, [540, 600]);
    expect(items.map((i) => [i.value, i.muted ?? false])).toEqual([
      [540, true],
      [600, false],
      [660, false],
    ]);
  });
});

describe("getWorkingRanges", () => {
  it("uses the fallback range without any data", () => {
    expect(getWorkingRanges([])).toEqual({ all: FALLBACK_RANGE, byDay: {} });
  });

  it("takes the widest range across working days for the common range", () => {
    const ranges = getWorkingRanges([
      wd("2026-09-28", "10:00", "18:00"),
      wd("2026-10-05", "09:00", "17:00"),
      wd("2026-09-29", "11:00", "20:00"),
    ]);
    expect(ranges.all).toEqual({ start: 540, end: 1200 });
    expect(ranges.byDay).toEqual({});
  });

  it("falls back to the common range for days without hours", () => {
    const ranges = getWorkingRanges([wd("2026-09-28", "10:00", "18:00")]);
    expect(getDayRange(ranges, "sun")).toEqual(ranges.all);
    expect(getDaySource(ranges, "sun")).toBe("common");
  });
});

describe("week template", () => {
  const templateDays = Array.from({ length: 7 }, (_, i) => ({
    isEnabled: i === 0 || i === 2,
    startAt: i === 0 ? "10:00" : "12:00",
    endAt: i === 0 ? "18:00" : "00:00",
    breaks: [],
  }));

  it("maps enabled template days Monday-first and ignores the rest", () => {
    expect(getTemplateRanges(templateDays)).toEqual({
      mon: { start: 600, end: 1080 },
      wed: { start: 720, end: 1440 },
    });
  });

  it("is the source of truth for weekdays, even over working days", () => {
    const ranges = getWorkingRanges(
      [wd("2026-09-28", "09:00", "17:00")],
      getTemplateRanges(templateDays),
    );
    expect(getDayRange(ranges, "mon")).toEqual({ start: 600, end: 1080 });
    expect(getDaySource(ranges, "mon")).toBe("template");
    expect(getDayRange(ranges, "tue")).toEqual({ start: 540, end: 1020 });
    expect(getDaySource(ranges, "tue")).toBe("common");
    expect(ranges.all).toEqual({ start: 540, end: 1020 });
  });

  it("builds the common range from the template when there are no working days", () => {
    expect(getWorkingRanges([], getTemplateRanges(templateDays)).all).toEqual({
      start: 600,
      end: 1440,
    });
  });

  it("ignores an empty template", () => {
    const empty = templateDays.map((d) => ({ ...d, isEnabled: false }));
    const ranges = getWorkingRanges([], getTemplateRanges(empty));
    expect(ranges.all).toEqual(FALLBACK_RANGE);
    expect(ranges.byDay).toEqual({});
  });
});

describe("long-interval grid", () => {
  it("starts at the schedule start rounded up to a whole hour and steps by the interval", () => {
    expect(buildGrid(180, { start: 600, end: 1140 })).toEqual([600, 780, 960]);
  });

  it("allows a time one hour before the end of the day", () => {
    expect(buildGrid(240, { start: 600, end: 1200 })).toEqual([600, 840, 1080]);
  });

  it("rounds a half-hour start up to the next whole hour", () => {
    expect(buildGrid(120, { start: 570, end: 780 })).toEqual([600, 720]);
  });

  it("shows selected whole hours inside the schedule as regular, outside as muted", () => {
    const items = buildGridItems(
      180,
      { start: 600, end: 1140 },
      [660, 540, 960],
    );
    expect(items.map((i) => [i.value, i.muted ?? false])).toEqual([
      [540, true],
      [600, false],
      [660, false],
      [780, false],
      [960, false],
    ]);
  });
});
