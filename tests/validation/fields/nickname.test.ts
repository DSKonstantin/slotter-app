import { nicknameField } from "@/src/validation/fields/nickname";

describe("nicknameField", () => {
  it("requires a value", () => {
    expect(nicknameField.isValidSync(undefined)).toBe(false);
  });

  it("enforces the 3-30 character length window", () => {
    expect(nicknameField.isValidSync("ab")).toBe(false);
    expect(nicknameField.isValidSync("abc")).toBe(true);
    expect(nicknameField.isValidSync("a".repeat(30))).toBe(true);
    expect(nicknameField.isValidSync("a".repeat(31))).toBe(false);
  });

  it("only allows Latin letters, digits and underscore", () => {
    expect(nicknameField.isValidSync("barber_92")).toBe(true);
    expect(nicknameField.isValidSync("бар-бер")).toBe(false);
    expect(nicknameField.isValidSync("barber 92")).toBe(false);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(nicknameField.isValidSync("  barber_92  ")).toBe(true);
  });
});
