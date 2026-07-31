import { transliterate } from "@/src/utils/text/transliterate";

describe("transliterate", () => {
  it("lowercases and maps Cyrillic letters to Latin", () => {
    expect(transliterate("Иван")).toBe("ivan");
  });

  it("maps multi-letter transliterations", () => {
    expect(transliterate("щука")).toBe("shchuka");
    expect(transliterate("Чехия")).toBe("chekhiya");
  });

  it("drops soft/hard signs", () => {
    expect(transliterate("объём")).toBe("obem");
  });

  it("passes through characters that are not in the map (digits, Latin, punctuation)", () => {
    expect(transliterate("barber_92")).toBe("barber_92");
  });
});
