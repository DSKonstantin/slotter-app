import { passwordField } from "@/src/validation/fields/password";

describe("passwordField", () => {
  it("requires a value", () => {
    expect(passwordField.isValidSync(undefined)).toBe(false);
    expect(passwordField.isValidSync("")).toBe(false);
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(passwordField.isValidSync("Aa1aaaa")).toBe(false);
  });

  it("requires at least one lowercase, one uppercase and one digit", () => {
    expect(passwordField.isValidSync("aaaaaaaa1")).toBe(false);
    expect(passwordField.isValidSync("AAAAAAAA1")).toBe(false);
    expect(passwordField.isValidSync("Aaaaaaaaaa")).toBe(false);
  });

  it("rejects disallowed characters (e.g. spaces, most Unicode)", () => {
    expect(passwordField.isValidSync("Aa1 aaaa")).toBe(false);
    expect(passwordField.isValidSync("Aa1ааааа")).toBe(false);
  });

  it("accepts a password meeting every requirement", () => {
    expect(passwordField.isValidSync("Aa1aaaaa")).toBe(true);
    expect(passwordField.isValidSync("P@ssw0rd!")).toBe(true);
  });
});
