import { priceField } from "@/src/validation/fields/price";

describe("priceField", () => {
  it("requires a value", () => {
    expect(priceField.isValidSync(undefined)).toBe(false);
    expect(priceField.isValidSync("")).toBe(false);
  });

  it("accepts a non-negative number, including zero", () => {
    expect(priceField.isValidSync("1500")).toBe(true);
    expect(priceField.isValidSync("0")).toBe(true);
  });

  it("rejects negative numbers and non-numeric input", () => {
    expect(priceField.isValidSync("-1")).toBe(false);
    expect(priceField.isValidSync("abc")).toBe(false);
  });
});
