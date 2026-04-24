import type {
  Appointment,
  AppointmentStatus,
  WorkingDayBreak,
} from "@/src/store/redux/services/api-types";
import {
  LONG_SLOT_MIN_HEIGHT,
  MINUTE_HEIGHT,
  SHORT_SLOT_MIN_HEIGHT,
  SLOT_GAP,
} from "./constants";
import { parseTime } from "./utils";

// ── Types ────────────────────────────────────────────────────────────

export type ParsedBreak = {
  start: number;
  end: number;
  breakItem: WorkingDayBreak;
};

export type ParsedAppointment = {
  start: number;
  end: number;
  slot: Appointment;
  blocksTime: boolean;
  isVisible: boolean;
};

export type SegmentContent =
  | { kind: "break"; breakItem: WorkingDayBreak }
  | {
      kind: "slots";
      slots: Appointment[];
      showFreeSlotBlock: boolean;
      showFilteredBlock: boolean;
      filteredBlockMinHeight: number;
    };

export type Segment = {
  segStart: number;
  segEnd: number;
  content: SegmentContent;
};

// ── Helpers ──────────────────────────────────────────────────────────

export const getSlotMinHeight = (slot: Appointment) =>
  slot.duration > 29 ? LONG_SLOT_MIN_HEIGHT : SHORT_SLOT_MIN_HEIGHT;

export const slotOccupiesTime = (slot: Appointment) =>
  slot.status !== "cancelled" && slot.duration > 0;

const occupiesTime = ({ blocksTime, slot }: ParsedAppointment) =>
  blocksTime && slot.duration > 0;

// ── Parsing ──────────────────────────────────────────────────────────

const parseBreaks = (breaks: WorkingDayBreak[]): ParsedBreak[] =>
  breaks.map((breakItem) => ({
    start: parseTime(breakItem.start_at),
    end: parseTime(breakItem.end_at),
    breakItem,
  }));

const parseAppointments = (
  appointments: Appointment[],
  visibleStatuses: AppointmentStatus[],
): ParsedAppointment[] => {
  const visibleStatusesSet = new Set(visibleStatuses);

  return appointments.map((slot) => {
    const start = parseTime(slot.start_time);

    return {
      start,
      end: start + slot.duration,
      slot,
      blocksTime: slot.status !== "cancelled",
      isVisible: visibleStatusesSet.has(slot.status),
    };
  });
};

// ── Time points ──────────────────────────────────────────────────────

const collectTimePoints = (
  dayStart: number,
  dayEnd: number,
  parsedBreaks: ParsedBreak[],
  blockingAppointments: ParsedAppointment[],
) => {
  const timePoints = new Set<number>([dayStart, dayEnd]);
  const startHour = Math.ceil(dayStart / 60);
  const endHour = Math.floor(dayEnd / 60);

  for (let hour = startHour; hour <= endHour; hour++) {
    const hourMinute = hour * 60;
    const insideBreak = parsedBreaks.some(
      (breakItem) => breakItem.start < hourMinute && breakItem.end > hourMinute,
    );
    const insideAppointment = blockingAppointments.some(
      ({ start, end, slot }) =>
        slot.duration > 0 && start < hourMinute && end > hourMinute,
    );

    if (!insideBreak && !insideAppointment) {
      timePoints.add(hourMinute);
    }
  }

  parsedBreaks.forEach((breakItem) => {
    timePoints.add(breakItem.start);
    timePoints.add(breakItem.end);
  });

  blockingAppointments.forEach((appointment) => {
    const isInsideLongerAppointment =
      appointment.slot.duration === 0 &&
      blockingAppointments.some(
        (other) =>
          other.slot.duration > 0 &&
          other.start < appointment.start &&
          other.end > appointment.start,
      );

    if (
      !isInsideLongerAppointment &&
      appointment.start >= dayStart &&
      appointment.start <= dayEnd
    ) {
      timePoints.add(appointment.start);
    }

    if (appointment.end > dayStart && appointment.end <= dayEnd) {
      timePoints.add(appointment.end);
    }
  });

  return Array.from(timePoints).sort((a, b) => a - b);
};

// ── Segment building ─────────────────────────────────────────────────

const buildSegments = (
  timePoints: number[],
  parsedBreaks: ParsedBreak[],
  parsedAppointments: ParsedAppointment[],
): Segment[] =>
  timePoints.slice(0, -1).map((segStart, index) => {
    const segEnd = timePoints[index + 1];
    const breakItem = parsedBreaks.find(
      (parsedBreak) =>
        parsedBreak.start <= segStart && parsedBreak.end >= segEnd,
    );

    if (breakItem) {
      return {
        segStart,
        segEnd,
        content: { kind: "break", breakItem: breakItem.breakItem } as const,
      };
    }

    const segmentAppointments = parsedAppointments
      .filter(({ start }) => start >= segStart && start < segEnd)
      .sort((a, b) => a.start - b.start);
    const visibleAppointments = segmentAppointments.filter(
      ({ isVisible }) => isVisible,
    );
    const hiddenOccupiedAppointments = segmentAppointments.filter(
      (appointment) => !appointment.isVisible && occupiesTime(appointment),
    );

    return {
      segStart,
      segEnd,
      content: {
        kind: "slots",
        slots: visibleAppointments.map(({ slot }) => slot),
        showFreeSlotBlock: !segmentAppointments.some(occupiesTime),
        showFilteredBlock:
          hiddenOccupiedAppointments.length > 0 &&
          visibleAppointments.length === 0,
        filteredBlockMinHeight:
          hiddenOccupiedAppointments.reduce(
            (total, appointment) => total + getSlotMinHeight(appointment.slot),
            0,
          ) +
          SLOT_GAP * Math.max(0, hiddenOccupiedAppointments.length - 1),
      } as const,
    };
  });

// ── Segment height ───────────────────────────────────────────────────

export const getSegmentHeight = (
  segStart: number,
  segEnd: number,
  content: SegmentContent,
) => {
  const baseGridHeight = (segEnd - segStart) * MINUTE_HEIGHT;

  if (content.kind === "break") return baseGridHeight;
  const slotsMinHeight =
    content.slots.reduce((total, slot) => total + getSlotMinHeight(slot), 0) +
    SLOT_GAP * content.slots.length;
  const freeSlotHeight = content.showFreeSlotBlock ? LONG_SLOT_MIN_HEIGHT : 0;
  const filteredBlockHeight = content.showFilteredBlock
    ? Math.max(SHORT_SLOT_MIN_HEIGHT, content.filteredBlockMinHeight)
    : 0;

  return Math.max(
    baseGridHeight,
    slotsMinHeight + freeSlotHeight + filteredBlockHeight,
  );
};

// ── Public API ───────────────────────────────────────────────────────

export const createSegments = (
  startAt: string,
  endAt: string,
  breaks: WorkingDayBreak[],
  appointments: Appointment[],
  visibleStatuses: AppointmentStatus[],
): Segment[] => {
  const dayStart = parseTime(startAt);
  const dayEnd = parseTime(endAt);
  const parsedBreaks = parseBreaks(breaks);
  const parsedAppointments = parseAppointments(appointments, visibleStatuses);
  const blockingAppointments = parsedAppointments.filter(
    ({ blocksTime }) => blocksTime,
  );
  const timePoints = collectTimePoints(
    dayStart,
    dayEnd,
    parsedBreaks,
    blockingAppointments,
  );

  return buildSegments(timePoints, parsedBreaks, parsedAppointments);
};
