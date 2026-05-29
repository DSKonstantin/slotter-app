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

type ParsedBreak = {
  start: number;
  end: number;
  breakItem: WorkingDayBreak;
};

export type ParsedAppointment = {
  start: number;
  end: number;
  slot: Appointment;
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
  slot.status !== "cancelled" &&
  slot.status !== "declined" &&
  slot.duration > 0;

const occupiesTime = ({ slot }: ParsedAppointment) => slotOccupiesTime(slot);

const stackedHeight = (appts: ParsedAppointment[]) =>
  appts.reduce((h, a) => h + getSlotMinHeight(a.slot), 0) +
  SLOT_GAP * Math.max(0, appts.length - 1);

// ── Parsing ──────────────────────────────────────────────────────────

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
  nonBlockingAppointments: ParsedAppointment[],
) => {
  const timePoints = new Set<number>([effectiveStart, effectiveEnd]);

  const addIfInside = (t: number | undefined) => {
    if (t !== undefined && t > effectiveStart && t < effectiveEnd)
      timePoints.add(t);
  };
  addIfInside(workingStart);
  addIfInside(workingEnd);

  const startHour = Math.ceil(effectiveStart / 60);
  const endHour = Math.floor(effectiveEnd / 60);

  for (let hour = startHour; hour <= endHour; hour++) {
    const t = hour * 60;
    if (parsedBreaks.some((b) => b.start < t && b.end > t)) continue;
    if (
      blockingAppointments.some(
        ({ start, end, slot }) => slot.duration > 0 && start < t && end > t,
      )
    )
      continue;
    if (
      workingStart !== undefined &&
      workingEnd !== undefined &&
      (t < workingStart || t > workingEnd)
    )
      continue;
    timePoints.add(t);
  }

  parsedBreaks.forEach(({ start, end }) => {
    timePoints.add(start);
    timePoints.add(end);
  });

  // Zero-duration appointments nested inside a longer one don't get their own boundary.
  const nestedZeroStarts = new Set(
    blockingAppointments
      .filter(
        ({ slot, start }) =>
          slot.duration === 0 &&
          blockingAppointments.some(
            (other) =>
              other.slot.duration > 0 &&
              other.start < start &&
              other.end > start,
          ),
      )
      .map(({ start }) => start),
  );

  blockingAppointments.forEach(({ slot, start, end }) => {
    const isNested = slot.duration === 0 && nestedZeroStarts.has(start);

    if (!isNested && start >= effectiveStart && start <= effectiveEnd) {
      timePoints.add(start);
      // Zero-duration outside working hours: add start+1 so the following gap can be compressed.
      // Inside working hours the next segment is a free slot — no split needed.
      const outsideWork =
        workingStart === undefined ||
        workingEnd === undefined ||
        start < workingStart ||
        start >= workingEnd;
      if (slot.duration === 0 && outsideWork && start + 1 <= effectiveEnd) {
        timePoints.add(start + 1);
      }
    }

    if (end > effectiveStart && end <= effectiveEnd) {
      timePoints.add(end);
    }
  });

  nonBlockingAppointments.forEach(({ start, end }) => {
    if (start >= effectiveStart && start <= effectiveEnd) timePoints.add(start);
    if (end > effectiveStart && end <= effectiveEnd) timePoints.add(end);
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
    const matchingBreak = parsedBreaks.find(
      (b) => b.start <= segStart && b.end >= segEnd,
    );

    if (matchingBreak) {
      return {
        segStart,
        segEnd,
        isOutsideWorking,
        isCompressed: false,
        content: { kind: "break", breakItem: matchingBreak.breakItem } as const,
      };
    }

    const segmentAppointments = parsedAppointments
      .filter(({ start }) => start >= segStart && start < segEnd)
      .sort((a, b) => a.start - b.start || a.slot.duration - b.slot.duration);
    const visibleAppointments = segmentAppointments.filter(
      ({ isVisible }) => isVisible,
    );
    const hiddenOccupied = segmentAppointments.filter(
      (a) => !a.isVisible && occupiesTime(a),
    );

    const isOverlappedByPrior = parsedAppointments.some(
      (a) => occupiesTime(a) && a.start < segStart && a.end > segStart,
    );
    const showFreeSlotBlock = !isOutsideWorking && !isOverlappedByPrior;
    const showFilteredBlock =
      hiddenOccupied.length > 0 && visibleAppointments.length === 0;
    const isCompressed =
      isOutsideWorking &&
      visibleAppointments.length === 0 &&
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
        filteredBlockMinHeight: stackedHeight(hiddenOccupied),
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
    content.slots.reduce((h, slot) => h + getSlotMinHeight(slot), 0) +
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
  const parsedBreaks = breaks.map((b) => ({
    start: parseTime(b.start_at),
    end: parseTime(b.end_at),
    breakItem: b,
  }));
  const parsedAppointments = parseAppointments(appointments, visibleStatuses);
  const blockingAppointments = parsedAppointments.filter(
    ({ slot }) => slot.status !== "cancelled" && slot.status !== "declined",
  );
  const nonBlockingAppointments = parsedAppointments.filter(
    ({ slot }) => slot.status === "cancelled" || slot.status === "declined",
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

  // Extend by 1 if a zero-duration appointment sits exactly at the boundary
  // so collectTimePoints can create a segment for it.
  if (
    parsedAppointments.some(
      (a) => a.slot.duration === 0 && a.start === effectiveEnd,
    ) &&
    effectiveEnd < 24 * 60
  ) {
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
    nonBlockingAppointments,
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
