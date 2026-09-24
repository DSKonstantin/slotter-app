import {
  getHalfHourMarks,
  getHourMarks,
} from "@/src/components/app/calendar/home/day/timeSlotList/gridMarks";

describe("getHourMarks", () => {
  it("returns on-the-hour marks for a plain middle segment", () => {
    // 10:00-13:00, day runs 09:00-18:00 — nowhere near either boundary
    expect(getHourMarks(600, 780, 540, 1080)).toEqual([600, 660, 720]);
  });

  it("does not include segEnd when it's not the last segment", () => {
    expect(getHourMarks(600, 660, 540, 1080)).toEqual([600]);
  });

  it("adds a non-hour-aligned start as its own mark when isFirst", () => {
    // 11:30-13:00, day starts at 11:30
    expect(getHourMarks(690, 780, 690, 1080, true, false)).toEqual([690, 720]);
  });

  it("adds a non-hour-aligned end as its own mark when isLast", () => {
    // 21:00-23:05, day ends at 23:05 — 23:00 (1380) is dropped, too close
    // to the end; only the boundary itself stands in for that last hour.
    expect(getHourMarks(1260, 1385, 540, 1385, false, true)).toEqual([
      1260, 1320, 1385,
    ]);
  });

  it("does not drop a neighbor exactly at the gap threshold", () => {
    // MIN_BOUNDARY_MARK_GAP is 20 — a neighbor exactly 20 min away is kept
    // (the guard is a strict "<", not "<="). effectiveStart is set far away
    // so only the segEnd/effectiveEnd proximity is under test here.
    expect(getHourMarks(540, 560, 0, 560, false, true)).toEqual([540, 560]);
  });

  it("does not duplicate an hour-aligned boundary", () => {
    // 09:00-18:00, both ends already on the hour
    const marks = getHourMarks(540, 1080, 540, 1080, true, true);
    expect(marks).toEqual([540, 600, 660, 720, 780, 840, 900, 960, 1020, 1080]);
    expect(new Set(marks).size).toBe(marks.length);
  });

  it("handles isFirst and isLast together on a short segment", () => {
    // 11:30-11:50, entirely inside one hour, no hour mark in between
    expect(getHourMarks(690, 710, 690, 710, true, true)).toEqual([690, 710]);
  });

  it("drops a normal hour mark on a later segment that's too close to the day's own start (the 08:55 bug)", () => {
    // Day starts 08:55: segmentBuilder splits this into a tiny first
    // segment [08:55, 09:00) and a following normal [09:00, 10:00) one.
    // The first segment shows only its boundary...
    const firstSegment = getHourMarks(535, 540, 535, 1080, true, false);
    expect(firstSegment).toEqual([535]);
    // ...and the segment right after must NOT independently draw "09:00"
    // just because it's an ordinary on-the-hour mark for *it* — it's only
    // 5 minutes from the day's actual start, already covered by "08:55".
    const nextSegment = getHourMarks(540, 600, 535, 1080, false, false);
    expect(nextSegment).toEqual([]);
  });
});

describe("getHalfHourMarks", () => {
  it("returns the interior half-hour marks for a plain segment", () => {
    const hourMarks = getHourMarks(600, 780, 540, 1080);
    expect(getHalfHourMarks(600, 780, hourMarks, 540, 1080)).toEqual([
      630, 690, 750,
    ]);
  });

  it("excludes a half-hour boundary already covered by hourMarks", () => {
    // 11:30-13:00, day starts at 11:30 — that's already in hourMarks
    const hourMarks = getHourMarks(690, 780, 690, 1080, true, false);
    const halfHourMarks = getHalfHourMarks(690, 780, hourMarks, 690, 1080);
    expect(halfHourMarks).not.toContain(690);
    expect(halfHourMarks).toEqual([750]);
  });

  it("drops a half-hour mark too close to the day's end", () => {
    // 21:00-23:05, day ends at 23:05 — 22:30 is well clear either way
    const hourMarks = getHourMarks(1260, 1385, 540, 1385, false, true);
    const halfHourMarks = getHalfHourMarks(1260, 1385, hourMarks, 540, 1385);
    expect(halfHourMarks).toEqual([1290, 1350]);
  });
});
