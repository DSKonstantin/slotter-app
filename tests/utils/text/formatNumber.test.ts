import { formatNumber } from "@/src/utils/text/formatNumber";

const NBSP = " ";

describe("formatNumber", () => {
  it("groups thousands with a non-breaking space by default (ru-RU)", () => {
    expect(formatNumber(1025)).toBe(`1${NBSP}025`);
    expect(formatNumber(1000000)).toBe(`1${NBSP}000${NBSP}000`);
  });

  it("leaves numbers below 1000 unchanged", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(418)).toBe("418");
    expect(formatNumber(999)).toBe("999");
  });

  it("handles negative numbers", () => {
    expect(formatNumber(-1025)).toBe(`-1${NBSP}025`);
  });

  it("respects a custom locale", () => {
    expect(formatNumber(1025, "en-US")).toBe("1,025");
  });
});
