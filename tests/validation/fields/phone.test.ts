import { phoneField } from "@/src/validation/fields/phone";

describe("phoneField", () => {
  it("requires a value", () => {
    expect(phoneField.isValidSync(undefined)).toBe(false);
    expect(phoneField.isValidSync("")).toBe(false);
  });

  it("accepts a full Russian mobile number regardless of formatting mask", () => {
    expect(phoneField.isValidSync("+7 (999) 123-45-67")).toBe(true);
    expect(phoneField.isValidSync("79991234567")).toBe(true);
  });

  it("rejects numbers that aren't 11 digits starting with 7", () => {
    expect(phoneField.isValidSync("+8 999 123 45 67")).toBe(false); // wrong country code
    expect(phoneField.isValidSync("+7 999 123 45")).toBe(false); // too short
  });
});
