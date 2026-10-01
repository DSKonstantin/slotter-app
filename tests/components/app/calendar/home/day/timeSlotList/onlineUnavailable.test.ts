import {
  createSegments,
  getSegmentHeight,
} from "@/src/components/app/calendar/home/day/timeSlotList/segmentBuilder";
import { buildOnlineUnavailableLayouts } from "@/src/components/app/calendar/home/day/timeSlotList/onlineUnavailable";
import {
  MINUTE_HEIGHT,
  SHORT_SLOT_MIN_HEIGHT,
  SLOT_GAP,
} from "@/src/components/app/calendar/home/day/timeSlotList/constants";
import type {
  Appointment,
  AppointmentStatus,
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

const build = (appointments: Appointment[], visible = ALL_VISIBLE) =>
  createSegments("09:00", "14:00", [], appointments, visible).segments;

const rowTop = (segments: ReturnType<typeof build>, index: number) =>
  segments.slice(0, index).reduce((y, seg) => y + getSegmentHeight(seg), 0);

describe("buildOnlineUnavailableLayouts", () => {
  const whole = [{ start: 9 * 60, end: 14 * 60 }];

  it("draws one block over an empty free range", () => {
    const segments = build([]);
    const layouts = buildOnlineUnavailableLayouts(segments, whole);

    expect(layouts).toHaveLength(1);
    expect(layouts[0]).toMatchObject({ start: 540, end: 840, top: SLOT_GAP });
    expect(layouts[0].height).toBe(300 * MINUTE_HEIGHT + 4 * SLOT_GAP);
  });

  it("splits the block around a visible cancelled card so it never covers it", () => {
    const cancelled = buildAppointment({
      id: 2,
      status: "cancelled",
      start_time: "11:15",
      end_time: "11:45",
    });
    const segments = build([cancelled]);
    const layouts = buildOnlineUnavailableLayouts(segments, whole);
    const cardSegment = segments.findIndex(
      (seg) => seg.segStart <= 675 && seg.segEnd > 675,
    );
    const cardBottom =
      rowTop(segments, cardSegment) + SLOT_GAP + SHORT_SLOT_MIN_HEIGHT;

    expect(layouts.map(({ start, end }) => [start, end])).toEqual([
      [540, 660],
      [660, 840],
    ]);
    expect(layouts[0].top + layouts[0].height).toBeLessThanOrEqual(
      rowTop(segments, cardSegment) + SLOT_GAP,
    );
    expect(layouts[1].top).toBeGreaterThanOrEqual(cardBottom);
  });

  it("keeps one block when the cancelled card is hidden by the filter", () => {
    const cancelled = buildAppointment({
      id: 2,
      status: "cancelled",
      start_time: "11:15",
      end_time: "11:45",
    });
    const segments = build([cancelled], ["confirmed"]);

    expect(buildOnlineUnavailableLayouts(segments, whole)).toHaveLength(1);
  });

  it("clips a range to the free segments it overlaps", () => {
    const segments = build([]);
    const layouts = buildOnlineUnavailableLayouts(segments, [
      { start: 10 * 60 + 30, end: 12 * 60 },
    ]);

    expect(layouts).toHaveLength(1);
    expect(layouts[0].height).toBe(90 * MINUTE_HEIGHT + SLOT_GAP);
  });

  it("returns nothing without ranges", () => {
    expect(buildOnlineUnavailableLayouts(build([]), [])).toEqual([]);
  });
});
