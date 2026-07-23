import { CalendarScheduleSchema } from "@/src/validation/schemas/calendarSchedule.schema";

const dayFactory = (overrides: Record<string, unknown> = {}) => ({
  date: "2026-07-22",
  isExisting: false,
  isSelected: true,
  startAt: "09:00",
  endAt: "18:00",
  breaks: [],
  ...overrides,
});

describe("CalendarScheduleSchema — bulk mode", () => {
  const context = { mode: "bulk" };

  it("requires commonDraft.startAt/endAt in bulk mode", () => {
    expect(
      CalendarScheduleSchema.isValidSync(
        { mode: "bulk", commonDraft: { startAt: "", endAt: "", breaks: [] } },
        { context },
      ),
    ).toBe(false);
  });

  it("accepts a valid commonDraft range", () => {
    expect(
      CalendarScheduleSchema.isValidSync(
        {
          mode: "bulk",
          commonDraft: { startAt: "09:00", endAt: "18:00", breaks: [] },
        },
        { context },
      ),
    ).toBe(true);
  });

  it("rejects endAt at or before startAt", () => {
    expect(
      CalendarScheduleSchema.isValidSync(
        {
          mode: "bulk",
          commonDraft: { startAt: "09:00", endAt: "09:00", breaks: [] },
        },
        { context },
      ),
    ).toBe(false);
  });
});

describe("CalendarScheduleSchema — perDay mode", () => {
  const context = { mode: "perDay" };

  it("accepts non-overlapping selected days with valid ranges", () => {
    expect(
      CalendarScheduleSchema.isValidSync(
        {
          mode: "perDay",
          calendarDays: [dayFactory(), dayFactory({ date: "2026-07-23" })],
        },
        { context },
      ),
    ).toBe(true);
  });

  it("ignores time-range validity for days that are not selected", () => {
    expect(
      CalendarScheduleSchema.isValidSync(
        {
          mode: "perDay",
          calendarDays: [
            dayFactory({ isSelected: false, startAt: "18:00", endAt: "09:00" }),
          ],
        },
        { context },
      ),
    ).toBe(true);
  });

  it("ignores time-range validity for existing (already-saved) days", () => {
    expect(
      CalendarScheduleSchema.isValidSync(
        {
          mode: "perDay",
          calendarDays: [
            dayFactory({ isExisting: true, startAt: "18:00", endAt: "09:00" }),
          ],
        },
        { context },
      ),
    ).toBe(true);
  });

  it("rejects a selected, non-existing day with endAt before startAt", () => {
    expect(
      CalendarScheduleSchema.isValidSync(
        {
          mode: "perDay",
          calendarDays: [dayFactory({ startAt: "18:00", endAt: "09:00" })],
        },
        { context },
      ),
    ).toBe(false);
  });

  it("rejects duplicate dates across calendarDays", () => {
    expect(
      CalendarScheduleSchema.isValidSync(
        {
          mode: "perDay",
          calendarDays: [dayFactory(), dayFactory()],
        },
        { context },
      ),
    ).toBe(false);
  });
});
