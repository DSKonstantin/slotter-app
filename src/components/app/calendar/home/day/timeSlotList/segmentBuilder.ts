import type {
  Appointment,
  AppointmentStatus,
  WorkingDayBreak,
} from "@/src/store/redux/services/api-types";
import {
  COMPRESSED_GAP_HEIGHT,
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
  isOutsideWorking: boolean;
  isCompressed: boolean;
  content: SegmentContent;
};

export type CreateSegmentsResult = {
  segments: Segment[];
  effectiveStart: number;
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
  effectiveStart: number,
  effectiveEnd: number,
  workingStart: number | undefined,
  workingEnd: number | undefined,
  parsedBreaks: ParsedBreak[],
  blockingAppointments: ParsedAppointment[],
) => {
  const timePoints = new Set<number>([effectiveStart, effectiveEnd]);

  if (
    workingStart !== undefined &&
    workingStart > effectiveStart &&
    workingStart < effectiveEnd
  ) {
    timePoints.add(workingStart);
  }
  if (
    workingEnd !== undefined &&
    workingEnd > effectiveStart &&
    workingEnd < effectiveEnd
  ) {
    timePoints.add(workingEnd);
  }

  const startHour = Math.ceil(effectiveStart / 60);
  const endHour = Math.floor(effectiveEnd / 60);

  for (let hour = startHour; hour <= endHour; hour++) {
    const hourMinute = hour * 60;
    const insideBreak = parsedBreaks.some(
      (breakItem) => breakItem.start < hourMinute && breakItem.end > hourMinute,
    );
    const insideAppointment = blockingAppointments.some(
      ({ start, end, slot }) =>
        slot.duration > 0 && start < hourMinute && end > hourMinute,
    );
    const insideOutsideWorking =
      workingStart !== undefined &&
      workingEnd !== undefined &&
      (hourMinute < workingStart || hourMinute > workingEnd);

    if (!insideBreak && !insideAppointment && !insideOutsideWorking) {
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
      appointment.start >= effectiveStart &&
      appointment.start <= effectiveEnd
    ) {
      timePoints.add(appointment.start);
    }

    if (appointment.end > effectiveStart && appointment.end <= effectiveEnd) {
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
  workingStart: number | undefined,
  workingEnd: number | undefined,
): Segment[] =>
  timePoints.slice(0, -1).map((segStart, index) => {
    const segEnd = timePoints[index + 1];
    const isOutsideWorking =
      workingStart === undefined ||
      workingEnd === undefined ||
      segEnd <= workingStart ||
      segStart >= workingEnd;
    const breakItem = parsedBreaks.find(
      (parsedBreak) =>
        parsedBreak.start <= segStart && parsedBreak.end >= segEnd,
    );

    if (breakItem) {
      return {
        segStart,
        segEnd,
        isOutsideWorking,
        isCompressed: false,
        content: { kind: "break", breakItem: breakItem.breakItem } as const,
      };
    }

    const segmentAppointments = parsedAppointments
      .filter(({ start }) => start >= segStart && start < segEnd)
      .sort((a, b) => a.start - b.start || a.slot.duration - b.slot.duration);
    const visibleAppointments = segmentAppointments.filter(
      ({ isVisible }) => isVisible,
    );
    const hiddenOccupiedAppointments = segmentAppointments.filter(
      (appointment) => !appointment.isVisible && occupiesTime(appointment),
    );

    const showFreeSlotBlock =
      !isOutsideWorking && !segmentAppointments.some(occupiesTime);
    const showFilteredBlock =
      hiddenOccupiedAppointments.length > 0 && visibleAppointments.length === 0;
    const isCompressed =
      isOutsideWorking &&
      visibleAppointments.length === 0 &&
      !showFreeSlotBlock &&
      !showFilteredBlock;

    return {
      segStart,
      segEnd,
      isOutsideWorking,
      isCompressed,
      content: {
        kind: "slots",
        slots: visibleAppointments.map(({ slot }) => slot),
        showFreeSlotBlock,
        showFilteredBlock,
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

export const getSegmentHeight = (segment: Segment) => {
  if (segment.isCompressed) return COMPRESSED_GAP_HEIGHT;

  const { segStart, segEnd, content } = segment;
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
  startAt: string | undefined,
  endAt: string | undefined,
  breaks: WorkingDayBreak[],
  appointments: Appointment[],
  visibleStatuses: AppointmentStatus[],
): CreateSegmentsResult => {
  const workingStart = startAt ? parseTime(startAt) : undefined;
  const workingEnd = endAt ? parseTime(endAt) : undefined;
  const parsedBreaks = parseBreaks(breaks);
  const parsedAppointments = parseAppointments(appointments, visibleStatuses);
  const blockingAppointments = parsedAppointments.filter(
    ({ blocksTime }) => blocksTime,
  );

  const apptStarts = parsedAppointments.map((a) => a.start);
  const apptEnds = parsedAppointments.map((a) => Math.max(a.start, a.end));

  let effectiveStart: number;
  let effectiveEnd: number;

  if (workingStart !== undefined && workingEnd !== undefined) {
    effectiveStart = Math.min(workingStart, ...apptStarts);
    effectiveEnd = Math.max(workingEnd, ...apptEnds);
  } else if (apptStarts.length > 0) {
    effectiveStart = Math.min(...apptStarts);
    effectiveEnd = Math.max(...apptEnds);
  } else {
    return { segments: [], effectiveStart: 0 };
  }

  effectiveStart = Math.max(0, effectiveStart);
  effectiveEnd = Math.min(24 * 60, effectiveEnd);

  const hasBoundaryZeroDuration = parsedAppointments.some(
    (a) => a.slot.duration === 0 && a.start === effectiveEnd,
  );
  if (hasBoundaryZeroDuration && effectiveEnd < 24 * 60) {
    effectiveEnd += 1;
  }

  if (effectiveEnd <= effectiveStart) {
    return { segments: [], effectiveStart };
  }

  const timePoints = collectTimePoints(
    effectiveStart,
    effectiveEnd,
    workingStart,
    workingEnd,
    parsedBreaks,
    blockingAppointments,
  );

  const segments = buildSegments(
    timePoints,
    parsedBreaks,
    parsedAppointments,
    workingStart,
    workingEnd,
  );

  return { segments, effectiveStart };
};
