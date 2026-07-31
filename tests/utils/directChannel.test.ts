import { isDirectChannelActive } from "@/src/utils/directChannel";

describe("isDirectChannelActive", () => {
  it("is true only when both status and provisioning_status are active", () => {
    expect(
      isDirectChannelActive({
        status: "active",
        provisioning_status: "active",
      }),
    ).toBe(true);
  });

  it("is false when only one of the two is active", () => {
    expect(
      isDirectChannelActive({
        status: "active",
        provisioning_status: "awaiting_auth",
      }),
    ).toBe(false);
    expect(
      isDirectChannelActive({
        status: "pending",
        provisioning_status: "active",
      }),
    ).toBe(false);
  });
});
