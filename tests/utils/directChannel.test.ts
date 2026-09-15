import { isDirectChannelActive } from "@/src/utils/directChannel";

describe("isDirectChannelActive", () => {
  it("is true when provisioning_status is active, regardless of billing status", () => {
    expect(isDirectChannelActive({ provisioning_status: "active" })).toBe(true);
  });

  it("is false when provisioning_status is not active", () => {
    expect(
      isDirectChannelActive({ provisioning_status: "awaiting_auth" }),
    ).toBe(false);
    expect(isDirectChannelActive({ provisioning_status: "none" })).toBe(false);
  });
});
