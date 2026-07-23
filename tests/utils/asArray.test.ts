import { asArray } from "@/src/utils/asArray";

describe("asArray", () => {
  it("passes an array through unchanged", () => {
    expect(asArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("returns an empty array for null/undefined", () => {
    expect(asArray(null)).toEqual([]);
    expect(asArray(undefined)).toEqual([]);
  });
});
