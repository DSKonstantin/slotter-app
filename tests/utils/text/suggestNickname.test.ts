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
    expect(suggestNicknames("Иван", "Иван", null)).toEqual([
      "ivan_ivan",
      "ivan",
    ]);
  });

  it("drops empty/whitespace-only inputs without producing empty candidates", () => {
    expect(suggestNicknames(null, null, null)).toEqual([]);
  });

  it("produces nothing when name is missing, even if surname is present", () => {
    expect(suggestNicknames("  ", "Петров", null)).toEqual([]);
  });

  it("sanitizes special characters out of each part", () => {
    expect(suggestNicknames("Анна-Мария", undefined, undefined)).toEqual([
      "annamariya",
    ]);
  });
});
