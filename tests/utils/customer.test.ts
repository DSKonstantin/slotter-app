import { isHiddenCustomer } from "@/src/utils/customer";

describe("isHiddenCustomer", () => {
  it("is false when there is no customer at all", () => {
    expect(isHiddenCustomer(null)).toBe(false);
    expect(isHiddenCustomer(undefined)).toBe(false);
  });

  it("is false for a real customer with an id", () => {
    expect(isHiddenCustomer({ id: 42 })).toBe(false);
  });

  it("is true for a quota-masked customer stub (id: null)", () => {
    expect(isHiddenCustomer({ id: null })).toBe(true);
  });
});
