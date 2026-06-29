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
      filteredBlock: { minHeight: number } | null;
      freeRangeStart: number;
      freeRangeEnd: number;
    };

export type Segment = {
  segStart: number;
  segEnd: number;
  content: SegmentContent;
};

export type CreateSegmentsResult = {
  segments: Segment[];
  effectiveStart: number;
};

// ── Helpers ──────────────────────────────────────────────────────────

export const getSlotMinHeight = (slot: Appointment) => {
  if (slot.status === "cancelled") return SHORT_SLOT_MIN_HEIGHT;
  return slot.duration > 30 ? LONG_SLOT_MIN_HEIGHT : SHORT_SLOT_MIN_HEIGHT;
};

export const slotOccupiesTime = (slot: Appointment) =>
  slot.status !== "cancelled" && slot.duration > 0;

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
  blockingAppointments.forEach(({ slot, start, end }) => {
    const isNested =
      slot.duration === 0 &&
      blockingAppointments.some(
        (o) => o.slot.duration > 0 && o.start < start && o.end > start,
      );

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

    if (!isNested && end > effectiveStart && end <= effectiveEnd) {
      timePoints.add(end);
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
    const matchingBreak = parsedBreaks.find(
      (b) => b.start <= segStart && b.end >= segEnd,
    );

    if (matchingBreak) {
      return {
        segStart,
        segEnd,
        content: { kind: "break", breakItem: matchingBreak.breakItem } as const,
      };
    }

    const segmentAppointments = parsedAppointments
      .filter(({ start }) => start >= segStart && start < segEnd)
      .sort((a, b) => {
        const aNB = a.slot.status === "cancelled" || a.slot.duration === 0;
        const bNB = b.slot.status === "cancelled" || b.slot.duration === 0;
        if (aNB !== bNB) return aNB ? -1 : 1;
        return a.start - b.start || a.slot.duration - b.slot.duration;
      });

    const visibleAppointments: Appointment[] = [];
    const hiddenOccupied: ParsedAppointment[] = [];
    for (const a of segmentAppointments) {
      if (a.isVisible) visibleAppointments.push(a.slot);
      else if (slotOccupiesTime(a.slot)) hiddenOccupied.push(a);
    }

    const isOverlappedByPrior = parsedAppointments.some(
      (a) =>
        slotOccupiesTime(a.slot) && a.start <= segStart && a.end > segStart,
    );
    const showFreeSlotBlock = !isOutsideWorking && !isOverlappedByPrior;
    const hasFilteredBlock =
      hiddenOccupied.length > 0 && visibleAppointments.length === 0;

    const content: SegmentContent = {
      kind: "slots",
      slots: visibleAppointments,
      showFreeSlotBlock,
      filteredBlock: hasFilteredBlock
        ? {
            minHeight:
              hiddenOccupied.reduce((h, a) => h + getSlotMinHeight(a.slot), 0) +
              SLOT_GAP * Math.max(0, hiddenOccupied.length - 1),
          }
        : null,
      freeRangeStart: segStart,
      freeRangeEnd: segEnd,
    };

    return { segStart, segEnd, content };
  });

// ── Free range annotation ─────────────────────────────────────────────

const annotateFreeRanges = (segments: Segment[]): Segment[] =>
  segments.map((seg, i) => {
    if (seg.content.kind !== "slots" || !seg.content.showFreeSlotBlock)
      return seg;

    let rangeStart = seg.segStart;
    for (let j = i - 1; j >= 0; j--) {
      const prev = segments[j];
      if (prev.content.kind === "slots" && prev.content.showFreeSlotBlock) {
        rangeStart = prev.segStart;
      } else {
        break;
      }
    }

    let rangeEnd = seg.segEnd;
    for (let j = i + 1; j < segments.length; j++) {
      const next = segments[j];
      if (next.content.kind === "slots" && next.content.showFreeSlotBlock) {
        rangeEnd = next.segEnd;
      } else {
        break;
      }
    }

    return {
      ...seg,
      content: {
        ...seg.content,
        freeRangeStart: rangeStart,
        freeRangeEnd: rangeEnd,
      },
    };
  });

// ── Segment height ───────────────────────────────────────────────────

export const getSegmentHeight = (segment: Segment) => {
  const { segStart, segEnd, content } = segment;
  const baseGridHeight = (segEnd - segStart) * MINUTE_HEIGHT;

  if (content.kind === "break")
    return Math.max(SHORT_SLOT_MIN_HEIGHT, baseGridHeight);

  const slotsMinHeight =
    content.slots.reduce((h, slot) => h + getSlotMinHeight(slot), 0) +
    SLOT_GAP * content.slots.length;
  const filteredBlockHeight = content.filteredBlock
    ? Math.max(SHORT_SLOT_MIN_HEIGHT, content.filteredBlock.minHeight)
    : 0;
  // Reserve exactly one gridHeight for the Pressable so time marks map 1:1 to the free slot area.
  const freeSlotReserve = content.showFreeSlotBlock
    ? SLOT_GAP + baseGridHeight
    : 0;

  return Math.max(
    baseGridHeight,
    slotsMinHeight + filteredBlockHeight + freeSlotReserve,
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
    ({ slot }) => slot.status !== "cancelled",
  );

  const allStarts = parsedAppointments.map((a) => a.start);
  const allEnds = parsedAppointments.map((a) => Math.max(a.start, a.end));

  let effectiveStart: number;
  let effectiveEnd: number;

  if (workingStart !== undefined && workingEnd !== undefined) {
    effectiveStart = workingStart;
    effectiveEnd = workingEnd;
  } else if (allStarts.length > 0) {
    effectiveStart = Math.min(...allStarts);
    effectiveEnd = Math.max(...allEnds);
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
  );

  const segments = annotateFreeRanges(
    buildSegments(
      timePoints,
      parsedBreaks,
      parsedAppointments,
      workingStart,
      workingEnd,
    ),
  );

  return { segments, effectiveStart };
};
