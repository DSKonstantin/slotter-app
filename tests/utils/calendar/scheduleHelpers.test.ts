import type { WorkingDay } from "@/src/store/redux/services/api-types/workingDay";
import {
  applyDraftToDay,
  areSameBreaks,
  areSameCalendarDays,
  areUniformDays,
  buildFormValues,
  clearSelectedDay,
  cloneBreaks,
  createDraftFromDay,
  createEmptyCalendarDay,
  createExistingCalendarDay,
  getScheduleTimeLabel,
} from "@/src/utils/calendar/scheduleHelpers";

const buildWorkingDay = (overrides: Partial<WorkingDay> = {}): WorkingDay => ({
  id: 1,
  user_id: 1,
  day: "2026-07-05",
  start_at: "2026-07-05T09:00:00.000Z",
  end_at: "2026-07-05T18:00:00.000Z",
  is_active: true,
  ...overrides,
});

describe("createEmptyCalendarDay", () => {
  it("builds a blank, unselected day for the given date", () => {
    expect(createEmptyCalendarDay("2026-07-05")).toEqual({
      date: "2026-07-05",
      workingDayId: undefined,
      isExisting: false,
      isSelected: false,
      startAt: "",
      endAt: "",
      breaks: [],
    });
  });
});

describe("createExistingCalendarDay", () => {
  it("maps a WorkingDay into calendar day values, formatting times and breaks", () => {
    const workingDay = buildWorkingDay({
      working_day_breaks: [
        {
          id: 1,
          working_day_id: 1,
          start_at: "2026-07-05T12:00:00.000Z",
          end_at: "2026-07-05T13:00:00.000Z",
        },
      ],
    });

    expect(createExistingCalendarDay("2026-07-05", workingDay)).toEqual({
      date: "2026-07-05",
      workingDayId: 1,
      isExisting: true,
      isSelected: false,
      startAt: "09:00",
      endAt: "18:00",
      breaks: [{ start: "12:00", end: "13:00" }],
    });
  });

  it("defaults to an empty breaks array when working_day_breaks is missing", () => {
    const workingDay = buildWorkingDay({ working_day_breaks: undefined });
    expect(createExistingCalendarDay("2026-07-05", workingDay).breaks).toEqual(
      [],
    );
  });
});

describe("buildFormValues", () => {
  it("creates one calendar day per day of the month, in bulk mode", () => {
    const result = buildFormValues(new Date(2026, 1, 10)); // Feb 2026 — 28 days
    expect(result.mode).toBe("bulk");
    expect(result.commonDraft).toEqual({ startAt: "", endAt: "", breaks: [] });
    expect(result.calendarDays).toHaveLength(28);
    expect(result.calendarDays[0].date).toBe("2026-02-01");
    expect(result.calendarDays[27].date).toBe("2026-02-28");
  });

  it("fills in existing working days from workingDaysData and leaves the rest empty", () => {
    const workingDay = buildWorkingDay({ day: "2026-07-05" });
    const result = buildFormValues(new Date(2026, 6, 1), {
      "2026-07-05": workingDay,
    });

    const existingDay = result.calendarDays.find(
      (day) => day.date === "2026-07-05",
    );
    const emptyDay = result.calendarDays.find(
      (day) => day.date === "2026-07-01",
    );

    expect(existingDay?.isExisting).toBe(true);
    expect(existingDay?.workingDayId).toBe(1);
    expect(emptyDay?.isExisting).toBe(false);
  });

  it("treats a null entry in workingDaysData as no working day", () => {
    const result = buildFormValues(new Date(2026, 6, 1), {
      "2026-07-05": null,
    });
    const day = result.calendarDays.find((d) => d.date === "2026-07-05");
    expect(day?.isExisting).toBe(false);
  });
});

describe("cloneBreaks", () => {
  it("returns new break objects with the same values", () => {
    const breaks = [{ start: "12:00", end: "13:00" }];
    const cloned = cloneBreaks(breaks);
    expect(cloned).toEqual(breaks);
    expect(cloned).not.toBe(breaks);
    expect(cloned[0]).not.toBe(breaks[0]);
  });

  it("defaults to an empty array when called without arguments", () => {
    expect(cloneBreaks()).toEqual([]);
  });
});

describe("createDraftFromDay", () => {
  it("copies startAt/endAt/breaks from the given day", () => {
    const day = {
      startAt: "09:00",
      endAt: "18:00",
      breaks: [{ start: "12:00", end: "13:00" }],
    };
    expect(createDraftFromDay(day)).toEqual(day);
  });

  it("defaults to empty values when no day is given", () => {
    expect(createDraftFromDay()).toEqual({
      startAt: "",
      endAt: "",
      breaks: [],
    });
  });
});

describe("areSameBreaks", () => {
  it("is true for breaks with the same start/end in the same order", () => {
    expect(
      areSameBreaks(
        [{ start: "12:00", end: "13:00" }],
        [{ start: "12:00", end: "13:00" }],
      ),
    ).toBe(true);
  });

  it("is false when lengths differ", () => {
    expect(areSameBreaks([{ start: "12:00", end: "13:00" }], [])).toBe(false);
  });

  it("is false when a start or end differs", () => {
    expect(
      areSameBreaks(
        [{ start: "12:00", end: "13:00" }],
        [{ start: "12:00", end: "14:00" }],
      ),
    ).toBe(false);
  });

  it("defaults both sides to empty arrays and is true for two undefineds", () => {
    expect(areSameBreaks()).toBe(true);
  });
});

describe("areSameCalendarDays", () => {
  const day = createEmptyCalendarDay("2026-07-05");

  it("is true for two lists with identical day values", () => {
    expect(areSameCalendarDays([day], [{ ...day }])).toBe(true);
  });

  it("is false when lengths differ", () => {
    expect(areSameCalendarDays([day], [])).toBe(false);
  });

  it("is false when a field, including nested breaks, differs", () => {
    expect(
      areSameCalendarDays(
        [day],
        [{ ...day, breaks: [{ start: "09:00", end: "10:00" }] }],
      ),
    ).toBe(false);
  });
});

describe("applyDraftToDay", () => {
  it("marks the day selected and overwrites startAt/endAt/breaks from the draft", () => {
    const day = createEmptyCalendarDay("2026-07-05");
    const draft = {
      startAt: "09:00",
      endAt: "18:00",
      breaks: [{ start: "12:00", end: "13:00" }],
    };

    const result = applyDraftToDay(day, draft);

    expect(result.isSelected).toBe(true);
    expect(result.startAt).toBe("09:00");
    expect(result.endAt).toBe("18:00");
    expect(result.breaks).toEqual(draft.breaks);
    expect(result.breaks).not.toBe(draft.breaks);
  });
});

describe("clearSelectedDay", () => {
  it("only unselects an existing day, keeping its times and breaks", () => {
    const day = {
      ...createEmptyCalendarDay("2026-07-05"),
      isExisting: true,
      isSelected: true,
      startAt: "09:00",
      endAt: "18:00",
      breaks: [{ start: "12:00", end: "13:00" }],
    };

    expect(clearSelectedDay(day)).toEqual({ ...day, isSelected: false });
  });

  it("resets startAt/endAt/breaks for a non-existing day", () => {
    const day = {
      ...createEmptyCalendarDay("2026-07-05"),
      isSelected: true,
      startAt: "09:00",
      endAt: "18:00",
      breaks: [{ start: "12:00", end: "13:00" }],
    };

    expect(clearSelectedDay(day)).toEqual({
      ...day,
      isSelected: false,
      startAt: "",
      endAt: "",
      breaks: [],
    });
  });
});

describe("areUniformDays", () => {
  it("is true for 0 or 1 days", () => {
    expect(areUniformDays([])).toBe(true);
    expect(areUniformDays([createEmptyCalendarDay("2026-07-05")])).toBe(true);
  });

  it("is true when every day shares the same times and breaks as the first", () => {
    const days = [
      {
        ...createEmptyCalendarDay("2026-07-05"),
        startAt: "09:00",
        endAt: "18:00",
      },
      {
        ...createEmptyCalendarDay("2026-07-06"),
        startAt: "09:00",
        endAt: "18:00",
      },
    ];
    expect(areUniformDays(days)).toBe(true);
  });

  it("is false when a later day's times differ from the first", () => {
    const days = [
      {
        ...createEmptyCalendarDay("2026-07-05"),
        startAt: "09:00",
        endAt: "18:00",
      },
      {
        ...createEmptyCalendarDay("2026-07-06"),
        startAt: "10:00",
        endAt: "18:00",
      },
    ];
    expect(areUniformDays(days)).toBe(false);
  });
});

describe("getScheduleTimeLabel", () => {
  it('formats as "start - end"', () => {
    const day = {
      ...createEmptyCalendarDay("2026-07-05"),
      startAt: "09:00",
      endAt: "18:00",
    };
    expect(getScheduleTimeLabel(day)).toBe("09:00 - 18:00");
  });
});
