import { durationField } from "@/src/validation/fields/duration";

describe("durationField", () => {
  it("rejects undefined/null/empty as 'not entered', not just 'invalid number'", () => {
    expect(durationField.isValidSync(undefined)).toBe(false);
    expect(durationField.isValidSync(null)).toBe(false);
    expect(durationField.isValidSync("")).toBe(false);
  });

  it("accepts a non-negative number, including zero", () => {
    expect(durationField.isValidSync("30")).toBe(true);
    expect(durationField.isValidSync("0")).toBe(true);
  });

  it("rejects negative numbers and non-numeric input", () => {
    expect(durationField.isValidSync("-5")).toBe(false);
    expect(durationField.isValidSync("abc")).toBe(false);
  });
});
