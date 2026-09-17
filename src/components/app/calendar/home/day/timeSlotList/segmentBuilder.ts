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
import { parseEndOfDayMinutes } from "@/src/utils/date/formatTime";

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
  | {
      kind: "break";
      breakItem: WorkingDayBreak;
      /** Visible but non-occupying appointments (cancelled, or zero
       * duration) starting in this window — e.g. a cancelled appointment
       * shown via the status filter. They don't compete with the break for
       * the segment, but still need to render somewhere instead of being
       * silently dropped. */
      nonOccupyingSlots?: Appointment[];
    }
  | {
      kind: "slots";
      slots: Appointment[];
      showFreeSlotBlock: boolean;
      filteredBlock: { minHeight: number } | null;
      freeRangeStart: number;
      freeRangeEnd: number;
      /** The lone slot's own "break after appointment" — folded into this
       * segment (instead of getting its own "break" segment) so the card
       * and its break render as one visual block. Only set when `slots`
       * has exactly one entry. */
      appointmentBreak?: WorkingDayBreak;
      /** A break (typically "occupied") whose time window fully covers
       * this segment too. The backend allows "Занять время" over an
       * existing appointment on purpose — the appointment still wins the
       * segment, this is only surfaced as a small indicator on its card. */
      overlappingBreak?: WorkingDayBreak;
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

/** `totalDuration` overrides `slot.duration` for the long/short-card
 * decision — pass the slot's duration plus its merged break-after when one
 * is attached (see `appointmentBreak` on "slots" content), so a short slot
 * rendered as a full (non-compact) card because of that merge still gets
 * the taller floor a full card actually needs, not the compact one. */
export const getSlotMinHeight = (slot: Appointment, totalDuration?: number) => {
  if (slot.status === "cancelled") return SHORT_SLOT_MIN_HEIGHT;
  return (totalDuration ?? slot.duration) > 30
    ? LONG_SLOT_MIN_HEIGHT
    : SHORT_SLOT_MIN_HEIGHT;
};

export const slotOccupiesTime = (slot: Appointment) =>
  slot.status !== "cancelled" && slot.duration > 0;

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

  const isInsideBlockingAppointment = (t: number) =>
    blockingAppointments.some(
      ({ start, end, slot }) => slot.duration > 0 && start < t && end > t,
    );

  const startHour = Math.ceil(effectiveStart / 60);
  const endHour = Math.floor(effectiveEnd / 60);

  for (let hour = startHour; hour <= endHour; hour++) {
    const t = hour * 60;
    if (parsedBreaks.some((b) => b.start < t && b.end > t)) continue;
    if (isInsideBlockingAppointment(t)) continue;
    if (
      workingStart !== undefined &&
      workingEnd !== undefined &&
      (t < workingStart || t > workingEnd)
    )
      continue;
    timePoints.add(t);
  }

  // A break's own start/end would otherwise always cut a segment here, even
  // when that point falls in the middle of an ongoing appointment — which
  // fragments the appointment's card into a sliver plus a blank "tail" with
  // nothing rendered in it (its own segment doesn't re-match the
  // appointment, since that only looks at what *starts* there). Skip adding
  // that boundary in that case, same as the hour-mark suppression above;
  // the appointment then renders as one normal, unfragmented card, and the
  // break still gets its own segment for whatever part of it falls outside
  // the appointment's span.
  parsedBreaks.forEach(({ start, end }) => {
    if (!isInsideBlockingAppointment(start)) timePoints.add(start);
    if (!isInsideBlockingAppointment(end)) timePoints.add(end);
  });

  blockingAppointments.forEach(({ slot, start, end }) => {
    const isNested =
      slot.duration === 0 &&
      blockingAppointments.some(
        (o) => o.slot.duration > 0 && o.start < start && o.end > start,
      );

    if (!isNested && start >= effectiveStart && start <= effectiveEnd) {
      timePoints.add(start);
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

    // A break normally wins the whole segment — but the backend explicitly
    // allows "Занять время" over an existing appointment (doesn't check for
    // overlap), so a visible, time-occupying appointment here must still be
    // shown; the break becomes an indicator on its card instead of
    // replacing it. A cancelled (or otherwise non-occupying) appointment
    // showing only because it's filtered visible doesn't count — it never
    // actually competes for this time, the break should still win.
    const hasOccupyingVisibleAppointment = segmentAppointments.some(
      (a) => a.isVisible && slotOccupiesTime(a.slot),
    );

    if (matchingBreak && !hasOccupyingVisibleAppointment) {
      const nonOccupyingSlots = segmentAppointments
        .filter((a) => a.isVisible && !slotOccupiesTime(a.slot))
        .map((a) => a.slot);

      return {
        segStart,
        segEnd,
        content: {
          kind: "break",
          breakItem: matchingBreak.breakItem,
          ...(nonOccupyingSlots.length > 0 && { nonOccupyingSlots }),
        } as const,
      };
    }

    const isOverlappedByPrior = parsedAppointments.some(
      (a) =>
        slotOccupiesTime(a.slot) && a.start <= segStart && a.end > segStart,
    );
    const showFreeSlotBlock =
      !isOutsideWorking && !isOverlappedByPrior && !matchingBreak;
    const hasFilteredBlock =
      hiddenOccupied.length > 0 && visibleAppointments.length === 0;

    const content: SegmentContent = {
      kind: "slots",
      slots: visibleAppointments,
      showFreeSlotBlock,
      overlappingBreak: matchingBreak?.breakItem,
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

export const isMergeableSlot = (slot: Appointment) =>
  slot.status !== "cancelled";

/** Folds a "break" segment into the preceding "slots" segment when it's the
 * lone slot's own break-after-appointment (contiguous, matching
 * appointment_id) — so the card's own time range just extends to cover it
 * (13:00-13:30 becomes 13:00-13:35) instead of showing a separate strip
 * below it. Cancelled slots are excluded defensively — the backend deletes
 * their break on cancel, so this shouldn't come up in real data anyway. */
const mergeAppointmentBreaks = (segments: Segment[]): Segment[] => {
  const merged: Segment[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const next = segments[i + 1];
    const slot =
      seg.content.kind === "slots" && seg.content.slots.length === 1
        ? seg.content.slots[0]
        : null;

    if (
      slot &&
      seg.content.kind === "slots" &&
      isMergeableSlot(slot) &&
      next?.content.kind === "break" &&
      next.content.breakItem.kind === "appointment" &&
      next.content.breakItem.appointment_id === slot.id &&
      seg.segEnd === next.segStart
    ) {
      merged.push({
        segStart: seg.segStart,
        segEnd: next.segEnd,
        content: {
          ...seg.content,
          showFreeSlotBlock: false,
          appointmentBreak: next.content.breakItem,
        },
      });
      i++;
      continue;
    }

    merged.push(seg);
  }

  return merged;
};

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

export const getSegmentHeight = (segment: Segment) => {
  const { segStart, segEnd, content } = segment;
  const baseGridHeight = (segEnd - segStart) * MINUTE_HEIGHT;

  if (content.kind === "break") {
    const nonOccupyingHeight = content.nonOccupyingSlots
      ? content.nonOccupyingSlots.reduce(
          (h, slot) => h + SLOT_GAP + getSlotMinHeight(slot),
          0,
        )
      : 0;
    return Math.max(baseGridHeight, SHORT_SLOT_MIN_HEIGHT + nonOccupyingHeight);
  }

  const slotsMinHeight =
    content.slots.reduce((h, slot) => {
      const totalDuration =
        content.appointmentBreak?.appointment_id === slot.id
          ? slot.duration +
            (parseTime(content.appointmentBreak.end_at) -
              parseTime(content.appointmentBreak.start_at))
          : slot.duration;
      return h + getSlotMinHeight(slot, totalDuration);
    }, 0) +
    SLOT_GAP * content.slots.length;
  const filteredBlockHeight = content.filteredBlock
    ? Math.max(SHORT_SLOT_MIN_HEIGHT, content.filteredBlock.minHeight)
    : 0;
  const freeSlotReserve = content.showFreeSlotBlock
    ? SLOT_GAP + baseGridHeight
    : 0;

  return Math.max(
    baseGridHeight,
    slotsMinHeight + filteredBlockHeight + freeSlotReserve,
  );
};

export const createSegments = (
  startAt: string | undefined,
  endAt: string | undefined,
  breaks: WorkingDayBreak[],
  appointments: Appointment[],
  visibleStatuses: AppointmentStatus[],
): CreateSegmentsResult => {
  const workingStart = startAt ? parseTime(startAt) : undefined;
  const workingEnd = endAt ? parseEndOfDayMinutes(endAt) : undefined;
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
    mergeAppointmentBreaks(
      buildSegments(
        timePoints,
        parsedBreaks,
        parsedAppointments,
        workingStart,
        workingEnd,
      ),
    ),
  );

  return { segments, effectiveStart };
};
