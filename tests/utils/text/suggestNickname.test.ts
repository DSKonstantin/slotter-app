import { suggestNicknames } from "@/src/utils/text/suggestNickname";

describe("suggestNicknames", () => {
  it("builds name/surname combinations plus solo fallbacks", () => {
    expect(suggestNicknames("Иван", "Петров", "Барбер")).toEqual([
      "ivan_petrov",
      "petrov_ivan",
      "barber_ivan",
      "ivan",
      "barber",
    ]);
  });

  it("de-duplicates candidates", () => {
    // name === surname collapses the two name/surname combos into one
    expect(suggestNicknames("Иван", "Иван", null)).toEqual([
      "ivan_ivan",
      "ivan",
    ]);
  });

  it("drops empty/whitespace-only inputs without producing empty candidates", () => {
    expect(suggestNicknames(null, null, null)).toEqual([]);
  });

  it("produces nothing when name is missing, even if surname is present", () => {
    // every candidate is gated on `n` (name) — a name-less surname never
    // surfaces on its own, which is easy to miss reading the source
    expect(suggestNicknames("  ", "Петров", null)).toEqual([]);
  });

  it("sanitizes special characters out of each part", () => {
    expect(suggestNicknames("Анна-Мария", undefined, undefined)).toEqual([
      "annamariya",
    ]);
  });
});
