import {
  centsToRubles,
  formatRublesFromCents,
  formatRublesWithSymbol,
  rublesToCents,
} from "@/src/utils/price/formatPrice";

// toLocaleString("ru-RU") groups thousands with U+00A0 (non-breaking space),
// not a regular space — must match that exact character.
const NBSP = " ";

describe("centsToRubles", () => {
  it("divides cents by 100", () => {
    expect(centsToRubles(150000)).toBe(1500);
    expect(centsToRubles(0)).toBe(0);
  });
});

describe("rublesToCents", () => {
  it("multiplies rubles by 100 and rounds", () => {
    expect(rublesToCents(1500)).toBe(150000);
    expect(rublesToCents(19.999)).toBe(2000);
  });
});

describe("formatRublesWithSymbol", () => {
  it("groups thousands with a non-breaking space and appends the ruble sign", () => {
    expect(formatRublesWithSymbol(1500)).toBe(`1${NBSP}500 ₽`);
    expect(formatRublesWithSymbol(0)).toBe("0 ₽");
  });
});

describe("formatRublesFromCents", () => {
  it("converts cents to rubles before formatting", () => {
    expect(formatRublesFromCents(150000)).toBe(`1${NBSP}500 ₽`);
  });

  it("round-trips with rublesToCents", () => {
    const cents = rublesToCents(3500);
    expect(formatRublesFromCents(cents)).toBe(`3${NBSP}500 ₽`);
  });
});
