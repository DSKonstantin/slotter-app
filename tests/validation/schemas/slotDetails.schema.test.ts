import { SlotDetailsSchema } from "@/src/validation/schemas/slotDetails.schema";

describe("SlotDetailsSchema", () => {
  it("accepts a valid duration/price with no comment", () => {
    expect(
      SlotDetailsSchema.isValidSync({ duration: "60", price: "1500" }),
    ).toBe(true);
  });

  it("defaults comment to an empty string when omitted", () => {
    expect(
      SlotDetailsSchema.cast({ duration: "60", price: "1500" }).comment,
    ).toBe("");
  });

  it("delegates to the shared duration/price field rules", () => {
    expect(
      SlotDetailsSchema.isValidSync({ duration: "-1", price: "1500" }),
    ).toBe(false);
    expect(
      SlotDetailsSchema.isValidSync({ duration: "60", price: "abc" }),
    ).toBe(false);
  });
});
