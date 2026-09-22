import { MIN_BOUNDARY_MARK_GAP } from "./constants";

const isNearBoundary = (t: number, boundary: number) =>
  Math.abs(t - boundary) < MIN_BOUNDARY_MARK_GAP;

/** Hour-aligned marks within [segStart, segEnd), plus the day's own
 * start/end (effectiveStart/effectiveEnd) when this is the list's first/
 * last segment — even when that boundary doesn't land on the hour (e.g.
 * 11:30-18:30 or 08:55-18:05).
 *
 * The day boundary is checked against every segment, not just the one
 * that owns it: a day starting at 08:55 splits into its own tiny first
 * segment plus a normal [09:00, ...) segment right after — that second
 * segment would otherwise show its own perfectly ordinary "09:00" mark
 * with no idea it's 5 minutes from the boundary mark next to it. */
export const getHourMarks = (
  segStart: number,
  segEnd: number,
  effectiveStart: number,
  effectiveEnd: number,
  isFirst?: boolean,
  isLast?: boolean,
): number[] => {
  const marks = new Set<number>();
  for (let t = Math.ceil(segStart / 60) * 60; t < segEnd; t += 60)
    if (!isNearBoundary(t, effectiveStart) && !isNearBoundary(t, effectiveEnd))
      marks.add(t);
  if (isFirst) marks.add(segStart);
  if (isLast) marks.add(segEnd);
  return Array.from(marks).sort((a, b) => a - b);
};

/** Half-hour marks within [segStart, segEnd], excluding anything already
 * covered by `hourMarks` (a boundary that happens to land on a half-hour,
 * e.g. 11:30) or too close to the day's start/end. */
export const getHalfHourMarks = (
  segStart: number,
  segEnd: number,
  hourMarks: number[],
  effectiveStart: number,
  effectiveEnd: number,
): number[] => {
  const hourSet = new Set(hourMarks);
  const marks: number[] = [];
  for (let t = Math.floor((segStart + 30) / 60) * 60 + 30; t <= segEnd; t += 60)
    if (
      !hourSet.has(t) &&
      !isNearBoundary(t, effectiveStart) &&
      !isNearBoundary(t, effectiveEnd)
    )
      marks.push(t);
  return marks;
};
