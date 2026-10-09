import type { SubscriptionDirectChannel } from "@/src/store/redux/services/api-types";
import {
  buildDirectChannelAttributes,
  getDirectChannelDaysLeft,
  getDirectChannelState,
  isDirectChannelActive,
} from "@/src/utils/directChannel";

const NOW = Date.parse("2026-10-10T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

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

describe("getDirectChannelState", () => {
  it.each([
    ["no subscription", undefined, "not_connected"],
    ["working channel", channel(), "active"],
    [
      "lost subscription",
      channel({ provisioning_status: "subscription_lost" }),
      "lost",
    ],
    [
      "failed provisioning even when billing is active",
      channel({ provisioning_status: "failed" }),
      "failed",
    ],
    [
      "active billing waiting for the account to be linked again",
      channel({
        provisioning_status: "awaiting_auth",
        is_ready_for_auth: true,
      }),
      "reconnect",
    ],
    [
      "active billing but the channel is not up yet",
      channel({ provisioning_status: "connecting" }),
      "connecting",
    ],
    ["unfinished payment", channel({ status: "pending" }), "pending_payment"],
    ["overdue payment", channel({ status: "grace" }), "grace"],
    ["cancelled subscription", channel({ status: "cancelled" }), "cancelled"],
    ["expired subscription", channel({ status: "expired" }), "expired"],
    [
      "paid and waiting for the account to be linked",
      channel({
        status: "paid",
        provisioning_status: "awaiting_auth",
        is_ready_for_auth: true,
      }),
      "awaiting_auth",
    ],
    [
      "paid and still being set up",
      channel({ status: "paid", provisioning_status: "connecting" }),
      "connecting",
    ],
    [
      "paid but not ready to be linked yet",
      channel({
        status: "paid",
        provisioning_status: "awaiting_auth",
        is_ready_for_auth: false,
      }),
      "connecting",
    ],
  ])("maps %s", (_label, input, expected) => {
    expect(getDirectChannelState(input)).toBe(expected);
  });
});

describe("getDirectChannelDaysLeft", () => {
  it("counts started days up to the end of the paid period", () => {
    const end = new Date(NOW + 2.2 * DAY).toISOString();

    expect(
      getDirectChannelDaysLeft(channel({ period_ends_at: end }), NOW),
    ).toBe(3);
  });

  it("is 1 during the last day and 0 once the period is over", () => {
    const today = new Date(NOW + 1000).toISOString();
    const past = new Date(NOW - 5 * DAY).toISOString();

    expect(
      getDirectChannelDaysLeft(channel({ period_ends_at: today }), NOW),
    ).toBe(1);
    expect(
      getDirectChannelDaysLeft(channel({ period_ends_at: past }), NOW),
    ).toBe(0);
  });

  it.each([
    ["no channel", undefined],
    ["no period end", channel({ period_ends_at: null })],
    [
      "cancelled subscription",
      channel({ status: "cancelled", period_ends_at: "2026-12-01T00:00:00Z" }),
    ],
    [
      "expired subscription",
      channel({ status: "expired", period_ends_at: "2026-12-01T00:00:00Z" }),
    ],
    ["invalid date", channel({ period_ends_at: "not a date" })],
  ])("is null for %s", (_label, input) => {
    expect(getDirectChannelDaysLeft(input, NOW)).toBeNull();
  });
});

describe("buildDirectChannelAttributes", () => {
  it("reports a state and days left for every channel plus one problem flag", () => {
    const attributes = buildDirectChannelAttributes([], NOW);

    expect(attributes).toEqual([
      { type: "string", key: "direct_telegram_status", value: "not_connected" },
      { type: "number", key: "direct_telegram_days_left", value: null },
      { type: "string", key: "direct_max_status", value: "not_connected" },
      { type: "number", key: "direct_max_days_left", value: null },
      { type: "string", key: "direct_whatsapp_status", value: "not_connected" },
      { type: "number", key: "direct_whatsapp_days_left", value: null },
      { type: "boolean", key: "direct_has_problem", value: false },
    ]);
  });

  it("matches each channel to its own attributes", () => {
    const attributes = buildDirectChannelAttributes(
      [
        channel({
          id: 1,
          kind: "telegram_direct",
          period_ends_at: new Date(NOW + 10 * DAY).toISOString(),
        }),
        channel({ id: 2, kind: "whatsapp_direct", status: "pending" }),
      ],
      NOW,
    );

    expect(attributes).toEqual(
      expect.arrayContaining([
        { type: "string", key: "direct_telegram_status", value: "active" },
        { type: "number", key: "direct_telegram_days_left", value: 10 },
        { type: "string", key: "direct_max_status", value: "not_connected" },
        {
          type: "string",
          key: "direct_whatsapp_status",
          value: "pending_payment",
        },
      ]),
    );
  });

  it.each([
    ["lost", { provisioning_status: "subscription_lost" as const }],
    ["failed", { provisioning_status: "failed" as const }],
    ["overdue payment", { status: "grace" as const }],
    [
      "channel to reconnect",
      {
        provisioning_status: "awaiting_auth" as const,
        is_ready_for_auth: true,
      },
    ],
  ])("flags a problem for %s", (_label, overrides) => {
    const attributes = buildDirectChannelAttributes([channel(overrides)], NOW);

    expect(attributes).toContainEqual({
      type: "boolean",
      key: "direct_has_problem",
      value: true,
    });
  });

  it.each([
    ["working", channel()],
    ["unfinished payment", channel({ status: "pending" })],
    ["expired", channel({ status: "expired" })],
    ["cancelled", channel({ status: "cancelled" })],
  ])("does not flag a problem for a %s channel", (_label, input) => {
    expect(buildDirectChannelAttributes([input], NOW)).toContainEqual({
      type: "boolean",
      key: "direct_has_problem",
      value: false,
    });
  });

  it("prefers a live subscription over an old expired one of the same kind", () => {
    const attributes = buildDirectChannelAttributes(
      [
        channel({ id: 5, status: "expired" }),
        channel({ id: 3, status: "active" }),
      ],
      NOW,
    );

    expect(attributes).toContainEqual({
      type: "string",
      key: "direct_telegram_status",
      value: "active",
    });
  });

  it("falls back to the newest ended subscription when nothing is live", () => {
    const attributes = buildDirectChannelAttributes(
      [
        channel({ id: 2, status: "expired" }),
        channel({ id: 9, status: "cancelled" }),
      ],
      NOW,
    );

    expect(attributes).toContainEqual({
      type: "string",
      key: "direct_telegram_status",
      value: "cancelled",
    });
  });
});
