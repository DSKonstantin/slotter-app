import { pluralize } from "@/src/utils/text/pluralize";

const FORMS: [string, string, string] = ["день", "дня", "дней"];

describe("pluralize", () => {
  it("uses the 'one' form for numbers ending in 1 (except 11)", () => {
    expect(pluralize(1, FORMS)).toBe("день");
    expect(pluralize(21, FORMS)).toBe("день");
    expect(pluralize(101, FORMS)).toBe("день");
  });

  it("uses the 'few' form for 2-4 (except 12-14)", () => {
    expect(pluralize(2, FORMS)).toBe("дня");
    expect(pluralize(3, FORMS)).toBe("дня");
    expect(pluralize(24, FORMS)).toBe("дня");
  });

  it("uses the 'many' form for 5-20 and the teens", () => {
    expect(pluralize(0, FORMS)).toBe("дней");
    expect(pluralize(5, FORMS)).toBe("дней");
    expect(pluralize(11, FORMS)).toBe("дней");
    expect(pluralize(12, FORMS)).toBe("дней");
    expect(pluralize(14, FORMS)).toBe("дней");
    expect(pluralize(19, FORMS)).toBe("дней");
  });

  it("handles negative counts the same as their absolute value", () => {
    expect(pluralize(-1, FORMS)).toBe("день");
    expect(pluralize(-11, FORMS)).toBe("дней");
  });
});
