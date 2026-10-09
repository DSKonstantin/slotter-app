import { renderHook } from "@testing-library/react-native";
import { skipToken } from "@reduxjs/toolkit/query";

import { useAppMetricaDirectChannelsSync } from "@/src/hooks/useAppMetricaDirectChannelsSync";
import type { SubscriptionDirectChannel } from "@/src/store/redux/services/api-types";

const NOW = Date.parse("2026-10-10T12:00:00Z");

const mockSetProfileAttributes = jest.fn();
const mockUseQuery = jest.fn();

let mockState: {
  auth: {
    status: string;
    token: string | null;
    user: { id: number; onboarding_step: string } | null;
  };
  appVersion: { ispe: boolean };
};
let mockChannels: SubscriptionDirectChannel[] | undefined;

jest.mock("@/src/services/appMetrica", () => ({
  setProfileAttributes: (attributes: unknown) =>
    mockSetProfileAttributes(attributes),
}));

jest.mock("@/src/store/redux/store", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector(mockState),
}));

jest.mock("@/src/store/redux/services/api/subscriptionDirectApi", () => ({
  useGetSubscriptionDirectChannelsQuery: (arg: unknown) => {
    const { skipToken: skip } = require("@reduxjs/toolkit/query");
    mockUseQuery(arg);
    return {
      currentData:
        arg === skip || !mockChannels
          ? undefined
          : { subscription_direct_channels: mockChannels },
    };
  },
}));

const channel = (
  overrides: Partial<SubscriptionDirectChannel> = {},
): SubscriptionDirectChannel => ({
  id: 1,
  kind: "telegram_direct",
  status: "active",
  provisioning_status: "active",
  is_ready_for_auth: false,
  can_reconnect: false,
  period_ends_at: null,
  is_auto_renew: true,
  price_cents: 99000,
  price_currency: "RUB",
  ...overrides,
});

const statusOf = (call: number, key: string) =>
  mockSetProfileAttributes.mock.calls[call][0].find(
    (attribute: { key: string }) => attribute.key === key,
  )?.value;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, "now").mockReturnValue(NOW);
  mockState = {
    auth: {
      status: "authenticated",
      token: "token",
      user: { id: 42, onboarding_step: "completed" },
    },
    appVersion: { ispe: true },
  };
  mockChannels = [channel()];
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useAppMetricaDirectChannelsSync", () => {
  it("loads the channels of the signed in user", async () => {
    await renderHook(() => useAppMetricaDirectChannelsSync(true));

    expect(mockUseQuery).toHaveBeenCalledWith({ userId: 42 });
  });

  it("sends the channel state to AppMetrica", async () => {
    await renderHook(() => useAppMetricaDirectChannelsSync(true));

    expect(mockSetProfileAttributes).toHaveBeenCalledTimes(1);
    expect(statusOf(0, "direct_telegram_status")).toBe("active");
    expect(statusOf(0, "direct_max_status")).toBe("not_connected");
    expect(statusOf(0, "direct_has_problem")).toBe(false);
  });

  it("does not resend an unchanged state on re-render", async () => {
    const { rerender } = await renderHook(() =>
      useAppMetricaDirectChannelsSync(true),
    );

    await rerender({});
    await rerender({});

    expect(mockSetProfileAttributes).toHaveBeenCalledTimes(1);
  });

  it("sends again when a channel changes", async () => {
    const { rerender } = await renderHook(() =>
      useAppMetricaDirectChannelsSync(true),
    );
    mockChannels = [channel({ status: "grace" })];

    await rerender({});

    expect(mockSetProfileAttributes).toHaveBeenCalledTimes(2);
    expect(statusOf(1, "direct_telegram_status")).toBe("grace");
    expect(statusOf(1, "direct_has_problem")).toBe(true);
  });

  it("sends again for another user with identical channels", async () => {
    const { rerender } = await renderHook(() =>
      useAppMetricaDirectChannelsSync(true),
    );
    mockState.auth.user = { id: 7, onboarding_step: "completed" };

    await rerender({});

    expect(mockSetProfileAttributes).toHaveBeenCalledTimes(2);
  });

  it("sends nothing until the channels are loaded", async () => {
    mockChannels = undefined;

    await renderHook(() => useAppMetricaDirectChannelsSync(true));

    expect(mockSetProfileAttributes).not.toHaveBeenCalled();
  });

  it.each([
    ["the app version is not loaded yet", () => undefined, false],
    [
      "the user is not authenticated",
      () => {
        mockState.auth.status = "unauthenticated";
      },
      true,
    ],
    [
      "there is no token yet",
      () => {
        mockState.auth.token = null;
      },
      true,
    ],
    [
      "the onboarding is not completed",
      () => {
        mockState.auth.user = { id: 42, onboarding_step: "profile" };
      },
      true,
    ],
    [
      "the paid edition is off",
      () => {
        mockState.appVersion.ispe = false;
      },
      true,
    ],
    [
      "there is no user",
      () => {
        mockState.auth.user = null;
      },
      true,
    ],
  ])(
    "does not request or send anything when %s",
    async (_label, setup, enabled) => {
      setup();

      await renderHook(() => useAppMetricaDirectChannelsSync(enabled));

      expect(mockUseQuery).toHaveBeenCalledWith(skipToken);
      expect(mockSetProfileAttributes).not.toHaveBeenCalled();
    },
  );
});
