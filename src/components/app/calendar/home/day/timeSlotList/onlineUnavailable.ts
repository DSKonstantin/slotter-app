import type { TimeRange } from "@/src/utils/bookingFixedTime";
import {
  getTimeOffset,
  slotOccupiesTime,
  type Segment,
} from "./segmentBuilder";

export type OnlineUnavailableLayout = TimeRange & {
  top: number;
  height: number;
};

const hasLeadingCards = (segment: Segment) =>
  segment.content.kind === "slots" &&
  segment.content.slots.some((slot) => !slotOccupiesTime(slot));

export const buildOnlineUnavailableLayouts = (
  segments: Segment[],
  ranges: TimeRange[],
): OnlineUnavailableLayout[] => {
  const pieces: TimeRange[] = [];

  ranges.forEach((range) => {
    let current: TimeRange | null = null;
    segments.forEach((segment) => {
      if (segment.content.kind !== "slots") {
        current = null;
        return;
      }
      const start = Math.max(range.start, segment.segStart);
      const end = Math.min(range.end, segment.segEnd);
      if (end <= start) return;

      if (current && current.end === start && !hasLeadingCards(segment)) {
        current.end = end;
        return;
      }
      current = { start, end };
      pieces.push(current);
    });
  });

  return pieces.map((piece) => {
    const top = getTimeOffset(segments, piece.start);
    const bottom = getTimeOffset(segments, piece.end, "end");
    return { ...piece, top, height: bottom - top };
  });
};
