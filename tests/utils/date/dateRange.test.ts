import {
  endpointsToRange,
  rangeToDatePair,
  setRangeEndpoint,
  toRangeEndpoints,
  toggleRangeDay,
} from "@/src/utils/date/dateRange";

const A = "2026-03-01";
const B = "2026-03-10";
const C = "2026-03-20";

describe("toRangeEndpoints", () => {
  it("returns nulls for an empty range", () => {
    expect(toRangeEndpoints()).toEqual({ start: null, end: null });
    expect(toRangeEndpoints(null)).toEqual({ start: null, end: null });
  });

  it("collapses a single-day range to start only", () => {
    expect(toRangeEndpoints({ from: A, to: A })).toEqual({
      start: A,
      end: null,
    });
  });

  it("keeps both endpoints for a real range", () => {
    expect(toRangeEndpoints({ from: A, to: B })).toEqual({
      start: A,
      end: B,
    });
  });
});

describe("endpointsToRange", () => {
  it("returns undefined when nothing is selected", () => {
    expect(endpointsToRange({ start: null, end: null })).toBeUndefined();
  });

  it("expands a lone start into a single-day range", () => {
    expect(endpointsToRange({ start: A, end: null })).toEqual({
      from: A,
      to: A,
    });
  });

  it("keeps a full range", () => {
    expect(endpointsToRange({ start: A, end: B })).toEqual({ from: A, to: B });
  });

  it("round-trips with toRangeEndpoints", () => {
    expect(endpointsToRange(toRangeEndpoints({ from: A, to: B }))).toEqual({
      from: A,
      to: B,
    });
    expect(endpointsToRange(toRangeEndpoints({ from: A, to: A }))).toEqual({
      from: A,
      to: A,
    });
  });
});

describe("rangeToDatePair", () => {
  it("returns null without a range", () => {
    expect(rangeToDatePair()).toBeNull();
    expect(rangeToDatePair(null)).toBeNull();
  });

  it("returns [from, to] as Date objects", () => {
    expect(rangeToDatePair({ from: A, to: B })).toEqual([
      new Date(A),
      new Date(B),
    ]);
  });

  it("falls back to `from` when `to` is missing", () => {
    expect(rangeToDatePair({ from: A, to: "" })).toEqual([
      new Date(A),
      new Date(A),
    ]);
  });
});

describe("setRangeEndpoint", () => {
  it("starts a single-day range from nothing", () => {
    expect(setRangeEndpoint(undefined, "from", B)).toEqual({ from: B, to: B });
    expect(setRangeEndpoint(undefined, "to", B)).toEqual({ from: B, to: B });
  });

  describe('which = "from"', () => {
    it("moves the start, keeping a still-valid end", () => {
      expect(setRangeEndpoint({ from: B, to: C }, "from", A)).toEqual({
        from: A,
        to: C,
      });
    });

    it("collapses to a single day when the new start passes the end", () => {
      expect(setRangeEndpoint({ from: A, to: B }, "from", C)).toEqual({
        from: C,
        to: C,
      });
    });

    it("allows start === end", () => {
      expect(setRangeEndpoint({ from: A, to: C }, "from", C)).toEqual({
        from: C,
        to: C,
      });
    });
  });

  describe('which = "to"', () => {
    it("moves the end, keeping a still-valid start", () => {
      expect(setRangeEndpoint({ from: A, to: B }, "to", C)).toEqual({
        from: A,
        to: C,
      });
    });

    it("swaps when the new end lands before the start", () => {
      expect(setRangeEndpoint({ from: B, to: C }, "to", A)).toEqual({
        from: A,
        to: B,
      });
    });

    it("allows end === start", () => {
      expect(setRangeEndpoint({ from: A, to: C }, "to", A)).toEqual({
        from: A,
        to: A,
      });
    });
  });
});

describe("toggleRangeDay", () => {
  const empty = { start: null, end: null };

  it("selects a first day", () => {
    expect(toggleRangeDay(empty, B)).toEqual({ start: B, end: null });
  });

  it("clears when tapping the current start", () => {
    expect(toggleRangeDay({ start: B, end: null }, B)).toEqual(empty);
  });

  it("collapses to the start when tapping the current end", () => {
    expect(toggleRangeDay({ start: A, end: C }, C)).toEqual({
      start: A,
      end: null,
    });
  });

  it("extends forward into a range", () => {
    expect(toggleRangeDay({ start: A, end: null }, C)).toEqual({
      start: A,
      end: C,
    });
  });

  it("extends backward, swapping endpoints", () => {
    expect(toggleRangeDay({ start: B, end: null }, A)).toEqual({
      start: A,
      end: B,
    });
  });

  it("restarts the selection once a full range exists", () => {
    expect(toggleRangeDay({ start: A, end: C }, B)).toEqual({
      start: B,
      end: null,
    });
  });
});
