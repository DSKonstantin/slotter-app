import {
  createSegments,
  getSegmentHeight,
  getSlotMinHeight,
  isMergeableSlot,
  slotOccupiesTime,
  type SegmentContent,
} from "@/src/components/app/calendar/home/day/timeSlotList/segmentBuilder";
import {
  LONG_SLOT_MIN_HEIGHT,
  SHORT_SLOT_MIN_HEIGHT,
  SLOT_GAP,
} from "@/src/components/app/calendar/home/day/timeSlotList/constants";
import type {
  Appointment,
  AppointmentStatus,
  WorkingDayBreak,
} from "@/src/store/redux/services/api-types";

const buildAppointment = (
  overrides: Partial<Appointment> = {},
): Appointment => ({
  id: 1,
  status: "confirmed",
  payment_method: null,
  start_time: "10:00",
  end_time: "10:30",
  duration: 30,
  price_cents: 0,
  price_currency: "RUB",
  comment: null,
  cancel_reason: null,
  send_notification: false,
  break_after_minutes: 0,
  date: "2026-01-01",
  customer: {
    id: null,
    name: "",
    phone: "",
    email: null,
    telegram_id: null,
    avatar_url: null,
    avatar_blurhash: null,
    customer_tag: null,
    note: null,
  },
  services: [],
  additional_services: [],
  ...overrides,
});

const buildBreak = (
  overrides: Partial<WorkingDayBreak> = {},
): WorkingDayBreak => ({
  id: 1,
  working_day_id: 1,
  start_at: "12:00",
  end_at: "13:00",
  kind: "main",
  name: null,
  appointment_id: null,
  ...overrides,
});

const ALL_VISIBLE: AppointmentStatus[] = [
  "requested",
  "pending",
  "confirmed",
  "arrived",
  "completed",
  "delayed",
  "missed",
  "cancelled",
];

const slotsContent = (content: SegmentContent) => {
  if (content.kind !== "slots") throw new Error("expected slots content");
  return content;
};

describe("isMergeableSlot", () => {
  it("is true for a normal confirmed appointment", () => {
    expect(isMergeableSlot(buildAppointment({ status: "confirmed" }))).toBe(
      true,
    );
  });

  it("is true even for a short (<=30 min) appointment", () => {
    expect(
      isMergeableSlot(buildAppointment({ duration: 10, status: "confirmed" })),
    ).toBe(true);
  });

  it("is false for a cancelled appointment", () => {
    expect(isMergeableSlot(buildAppointment({ status: "cancelled" }))).toBe(
      false,
    );
  });
});

describe("createSegments", () => {
  it("returns no segments when there's no working day and no appointments", () => {
    expect(createSegments(undefined, undefined, [], [], ALL_VISIBLE)).toEqual({
      segments: [],
      effectiveStart: 0,
    });
  });

  it("builds a single free slots segment when nothing blocks a short window", () => {
    const { segments } = createSegments("09:00", "09:30", [], [], ALL_VISIBLE);

    expect(segments).toHaveLength(1);
    const content = slotsContent(segments[0].content);
    expect(content.slots).toEqual([]);
    expect(content.showFreeSlotBlock).toBe(true);
    expect(content.freeRangeStart).toBe(9 * 60);
    expect(content.freeRangeEnd).toBe(9 * 60 + 30);
  });

  it("renders a break as its own segment when nothing occupies its window", () => {
    const brk = buildBreak({
      start_at: "09:00",
      end_at: "09:30",
      name: "Обед",
    });
    const { segments } = createSegments(
      "09:00",
      "09:30",
      [brk],
      [],
      ALL_VISIBLE,
    );

    expect(segments).toHaveLength(1);
    expect(segments[0].content).toEqual({ kind: "break", breakItem: brk });
  });

  it("puts a single appointment into its own slots segment", () => {
    const appt = buildAppointment({ start_time: "10:15", duration: 15 });
    const { segments } = createSegments(
      "10:00",
      "11:00",
      [],
      [appt],
      ALL_VISIBLE,
    );

    const apptSegment = segments.find(
      (s) => s.content.kind === "slots" && s.content.slots.length > 0,
    );
    expect(apptSegment).toBeDefined();
    expect(slotsContent(apptSegment!.content).slots).toEqual([appt]);
  });

  it("keeps free segments before and after an appointment separate, each with its own free range", () => {
    const appt = buildAppointment({ start_time: "10:15", duration: 15 });
    const { segments } = createSegments(
      "10:00",
      "11:00",
      [],
      [appt],
      ALL_VISIBLE,
    );

    expect(segments).toHaveLength(3);
    const [before, during, after] = segments.map((s) =>
      slotsContent(s.content),
    );

    expect(before.freeRangeStart).toBe(10 * 60);
    expect(before.freeRangeEnd).toBe(10 * 60 + 15);
    expect(during.slots).toEqual([appt]);
    expect(after.freeRangeStart).toBe(10 * 60 + 30);
    expect(after.freeRangeEnd).toBe(11 * 60);
  });

  it("hides a not-currently-visible but occupying appointment behind a filteredBlock", () => {
    const appt = buildAppointment({
      start_time: "10:00",
      duration: 30,
      status: "requested",
    });
    const { segments } = createSegments(
      "10:00",
      "10:30",
      [],
      [appt],
      ["confirmed"],
    );

    expect(segments).toHaveLength(1);
    const content = slotsContent(segments[0].content);
    expect(content.slots).toEqual([]);
    expect(content.filteredBlock).not.toBeNull();
  });

  describe("merging a slot with its own break-after-appointment", () => {
    it("folds a contiguous matching 'appointment' break into the slot's segment", () => {
      const appt = buildAppointment({
        id: 42,
        start_time: "10:00",
        duration: 30,
        status: "confirmed",
      });
      const brk = buildBreak({
        kind: "appointment",
        appointment_id: 42,
        start_at: "10:30",
        end_at: "10:40",
      });
      const { segments } = createSegments(
        "10:00",
        "11:00",
        [brk],
        [appt],
        ALL_VISIBLE,
      );

      const merged = segments.find(
        (s) => s.content.kind === "slots" && s.content.slots.length === 1,
      );
      expect(merged).toBeDefined();
      expect(merged!.segStart).toBe(10 * 60);
      expect(merged!.segEnd).toBe(10 * 60 + 40);
      expect(slotsContent(merged!.content).appointmentBreak).toEqual(brk);
      // No separate "break" segment left over for it.
      expect(
        segments.some(
          (s) => s.content.kind === "break" && s.content.breakItem === brk,
        ),
      ).toBe(false);
    });

    it("still merges for a short (<=30 min) appointment", () => {
      const appt = buildAppointment({
        id: 7,
        start_time: "10:00",
        duration: 15,
        status: "confirmed",
      });
      const brk = buildBreak({
        kind: "appointment",
        appointment_id: 7,
        start_at: "10:15",
        end_at: "10:20",
      });
      const { segments } = createSegments(
        "10:00",
        "10:30",
        [brk],
        [appt],
        ALL_VISIBLE,
      );

      const merged = segments.find(
        (s) => s.content.kind === "slots" && s.content.slots.length === 1,
      );
      expect(merged!.segEnd).toBe(10 * 60 + 20);
      expect(slotsContent(merged!.content).appointmentBreak).toEqual(brk);
    });

    it("reserves the long-card floor for a merged slot whose own duration alone is short", () => {
      // Regression: a 20-min appointment + a 20-min break-after (40 total)
      // renders as a full (non-compact) card once merged, but
      // getSlotMinHeight/getSegmentHeight only looked at the slot's own
      // duration (20, <=30) and reserved the short/compact floor — too
      // little room for the full card layout actually being rendered.
      const appt = buildAppointment({
        id: 11,
        start_time: "10:00",
        duration: 20,
        status: "confirmed",
      });
      const brk = buildBreak({
        kind: "appointment",
        appointment_id: 11,
        start_at: "10:20",
        end_at: "10:40",
      });
      const { segments } = createSegments(
        "10:00",
        "10:40",
        [brk],
        [appt],
        ALL_VISIBLE,
      );

      const merged = segments.find(
        (s) => s.content.kind === "slots" && s.content.slots.length === 1,
      );
      expect(merged).toBeDefined();

      // Own duration alone (20) is <=30 — the short/compact floor.
      expect(getSlotMinHeight(appt)).toBe(SHORT_SLOT_MIN_HEIGHT);
      // The merged total (20 + 20 = 40) is >30 — must get the taller floor.
      expect(getSlotMinHeight(appt, 40)).toBe(LONG_SLOT_MIN_HEIGHT);

      // getSegmentHeight for the merged segment must reserve at least the
      // long-card floor, not the short one the slot's own raw duration
      // would otherwise imply.
      expect(getSegmentHeight(merged!)).toBeGreaterThanOrEqual(
        LONG_SLOT_MIN_HEIGHT + SLOT_GAP,
      );
    });

    it("does not merge when the segment holds more than one slot", () => {
      const apptA = buildAppointment({
        id: 1,
        start_time: "10:00",
        duration: 15,
      });
      const apptB = buildAppointment({
        id: 2,
        start_time: "10:00",
        duration: 15,
      });
      const brk = buildBreak({
        kind: "appointment",
        appointment_id: 1,
        start_at: "10:15",
        end_at: "10:20",
      });
      const { segments } = createSegments(
        "10:00",
        "10:30",
        [brk],
        [apptA, apptB],
        ALL_VISIBLE,
      );

      const doubleSlot = segments.find(
        (s) => s.content.kind === "slots" && s.content.slots.length === 2,
      );
      expect(doubleSlot).toBeDefined();
      // The break is still its own separate segment, untouched.
      expect(
        segments.some(
          (s) => s.content.kind === "break" && s.content.breakItem === brk,
        ),
      ).toBe(true);
    });

    it("keeps a zero-duration appointment's own card in nonOccupyingSlots when its break can't merge", () => {
      // A zero-duration appointment has start === end, so it never gets its
      // own "slots" segment to merge from — its break's window becomes the
      // segment instead, and the appointment itself must still show up
      // there (as a nonOccupyingSlot) so the UI has a card to render
      // instead of silently dropping it.
      const appt = buildAppointment({
        id: 9,
        start_time: "11:00",
        duration: 0,
        status: "confirmed",
      });
      const brk = buildBreak({
        kind: "appointment",
        appointment_id: 9,
        start_at: "11:00",
        end_at: "11:15",
      });
      const { segments } = createSegments(
        "10:00",
        "12:00",
        [brk],
        [appt],
        ALL_VISIBLE,
      );

      const breakSegment = segments.find(
        (s) => s.content.kind === "break" && s.content.breakItem === brk,
      );
      expect(breakSegment).toBeDefined();
      expect(
        breakSegment!.content.kind === "break" &&
          breakSegment!.content.nonOccupyingSlots,
      ).toEqual([appt]);
    });
  });

  describe("a break overlapping an existing appointment", () => {
    it("keeps the appointment visible instead of letting the break hide it", () => {
      const appt = buildAppointment({
        id: 9,
        start_time: "10:00",
        duration: 30,
      });
      const occupied = buildBreak({
        kind: "occupied",
        name: "Личное время",
        start_at: "10:00",
        end_at: "10:30",
      });
      const { segments } = createSegments(
        "10:00",
        "10:30",
        [occupied],
        [appt],
        ALL_VISIBLE,
      );

      expect(segments).toHaveLength(1);
      const content = slotsContent(segments[0].content);
      expect(content.slots).toEqual([appt]);
      expect(content.overlappingBreak).toEqual(occupied);
      expect(content.showFreeSlotBlock).toBe(false);
    });

    it("renders a partial overlap as one unfragmented appointment card plus the break's own remainder — not a blank tail", () => {
      // Regression: "Занято" 14:00-14:30 over an appointment 14:25-15:25 —
      // only the first 5 minutes actually overlap. The break's end (14:30)
      // used to always cut the grid there, splitting the appointment into
      // a tiny sliver (14:25-14:30, shown) and a tail (14:30-15:25) that
      // matched no segment content at all — a blank hole in the calendar
      // for the rest of the appointment's real duration.
      const appt = buildAppointment({
        id: 9,
        start_time: "14:25",
        duration: 60,
      });
      const occupied = buildBreak({
        kind: "occupied",
        name: "Занято",
        start_at: "14:00",
        end_at: "14:30",
      });
      const { segments } = createSegments(
        "14:00",
        "15:25",
        [occupied],
        [appt],
        ALL_VISIBLE,
      );

      expect(segments).toEqual([
        {
          segStart: 14 * 60,
          segEnd: 14 * 60 + 25,
          content: { kind: "break", breakItem: occupied },
        },
        {
          segStart: 14 * 60 + 25,
          segEnd: 15 * 60 + 25,
          content: expect.objectContaining({ kind: "slots", slots: [appt] }),
        },
      ]);
    });

    it("still renders as a plain break segment when nothing occupies its window", () => {
      const occupied = buildBreak({
        kind: "occupied",
        start_at: "10:00",
        end_at: "10:30",
      });
      const { segments } = createSegments(
        "10:00",
        "10:30",
        [occupied],
        [],
        ALL_VISIBLE,
      );

      expect(segments).toEqual([
        {
          segStart: 10 * 60,
          segEnd: 10 * 60 + 30,
          content: { kind: "break", breakItem: occupied },
        },
      ]);
    });

    it("still lets a 'main' break win when the only visible appointment there is cancelled, but keeps it visible too", () => {
      // Regression #1: filtering the calendar to show cancelled
      // appointments made a cancelled appointment inside a break's window
      // "eat" the break, since it counted as a visible appointment even
      // though it doesn't actually occupy that time.
      // Regression #2: the fix for that then made the break win outright
      // and silently drop the cancelled appointment the viewer explicitly
      // asked to see. Both need to show, side by side.
      const cancelled = buildAppointment({
        id: 5,
        start_time: "13:00",
        duration: 30,
        status: "cancelled",
      });
      const lunch = buildBreak({
        kind: "main",
        name: "Обед",
        start_at: "13:00",
        end_at: "13:30",
      });
      const { segments } = createSegments(
        "13:00",
        "13:30",
        [lunch],
        [cancelled],
        ALL_VISIBLE, // includes "cancelled" — the filter is on
      );

      expect(segments).toEqual([
        {
          segStart: 13 * 60,
          segEnd: 13 * 60 + 30,
          content: {
            kind: "break",
            breakItem: lunch,
            nonOccupyingSlots: [cancelled],
          },
        },
      ]);
    });

    it("doesn't attach nonOccupyingSlots when the cancelled appointment isn't visible (filter off)", () => {
      const cancelled = buildAppointment({
        id: 5,
        start_time: "13:00",
        duration: 30,
        status: "cancelled",
      });
      const lunch = buildBreak({
        kind: "main",
        start_at: "13:00",
        end_at: "13:30",
      });
      const { segments } = createSegments(
        "13:00",
        "13:30",
        [lunch],
        [cancelled],
        ["confirmed"], // cancelled not in the visible set
      );

      expect(segments).toEqual([
        {
          segStart: 13 * 60,
          segEnd: 13 * 60 + 30,
          content: { kind: "break", breakItem: lunch },
        },
      ]);
    });
  });
});

describe("slotOccupiesTime / getSlotMinHeight", () => {
  it("cancelled appointments don't occupy time", () => {
    expect(slotOccupiesTime(buildAppointment({ status: "cancelled" }))).toBe(
      false,
    );
  });

  it("zero-duration appointments don't occupy time", () => {
    expect(slotOccupiesTime(buildAppointment({ duration: 0 }))).toBe(false);
  });

  it("a real, ongoing appointment occupies time", () => {
    expect(
      slotOccupiesTime(buildAppointment({ duration: 30, status: "confirmed" })),
    ).toBe(true);
  });

  it("gives cancelled appointments the short min height regardless of duration", () => {
    expect(
      getSlotMinHeight(
        buildAppointment({ status: "cancelled", duration: 120 }),
      ),
    ).toBe(
      getSlotMinHeight(buildAppointment({ status: "cancelled", duration: 5 })),
    );
  });
});
