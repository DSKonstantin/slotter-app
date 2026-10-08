import { normalizePhone } from "@/src/utils/mask/maskPhone";

describe("normalizePhone", () => {
  it("turns a masked phone into +digits", () => {
    expect(normalizePhone("+7 916 123-45-67")).toBe("+79161234567");
  });

  it("adds the plus to a bare number", () => {
    expect(normalizePhone("79161234567")).toBe("+79161234567");
  });

  it("drops every non-digit character", () => {
    expect(normalizePhone("+ 7 (916) 123 45 67")).toBe("+79161234567");
  });

  it("gives just a plus for an empty value", () => {
    expect(normalizePhone("")).toBe("+");
  });
});
