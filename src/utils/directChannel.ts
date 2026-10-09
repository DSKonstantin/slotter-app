import type {
  DirectChannelKind,
  SubscriptionDirectChannel,
} from "@/src/store/redux/services/api-types";
import type { ProfileAttribute } from "@/src/services/appMetrica";

export type DirectChannelState =
  | "not_connected"
  | "active"
  | "lost"
  | "failed"
  | "reconnect"
  | "pending_payment"
  | "grace"
  | "awaiting_auth"
  | "connecting"
  | "cancelled"
  | "expired";

const ATTRIBUTE_CHANNELS: [DirectChannelKind, string][] = [
  ["telegram_direct", "telegram"],
  ["max_direct", "max"],
  ["whatsapp_direct", "whatsapp"],
];

const INACTIVE_STATUSES = new Set<string>(["cancelled", "expired"]);

const PROBLEM_STATES = new Set<DirectChannelState>([
  "lost",
  "failed",
  "reconnect",
  "grace",
]);

const DAY_MS = 24 * 60 * 60 * 1000;

export function isDirectChannelActive(
  channel: Pick<SubscriptionDirectChannel, "provisioning_status">,
) {
  return channel.provisioning_status === "active";
}

const pickChannel = (
  channels: SubscriptionDirectChannel[],
  kind: DirectChannelKind,
) => {
  const ofKind = channels.filter((channel) => channel.kind === kind);
  return (
    ofKind.find((channel) => !INACTIVE_STATUSES.has(channel.status)) ??
    [...ofKind].sort((a, b) => b.id - a.id)[0]
  );
};

export function getDirectChannelState(
  channel: SubscriptionDirectChannel | undefined,
): DirectChannelState {
  if (!channel) return "not_connected";
  if (channel.provisioning_status === "subscription_lost") return "lost";
  if (channel.provisioning_status === "failed") return "failed";

  const readyForAuth =
    channel.provisioning_status === "awaiting_auth" &&
    channel.is_ready_for_auth;

  switch (channel.status) {
    case "active":
      if (readyForAuth) return "reconnect";
      return isDirectChannelActive(channel) ? "active" : "connecting";
    case "pending":
      return "pending_payment";
    case "grace":
      return "grace";
    case "cancelled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return readyForAuth ? "awaiting_auth" : "connecting";
  }
}

export function getDirectChannelDaysLeft(
  channel: SubscriptionDirectChannel | undefined,
  now: number,
): number | null {
  if (
    !channel ||
    INACTIVE_STATUSES.has(channel.status) ||
    !channel.period_ends_at
  ) {
    return null;
  }
  const end = new Date(channel.period_ends_at).getTime();
  if (Number.isNaN(end)) return null;
  return Math.max(0, Math.ceil((end - now) / DAY_MS));
}

export function buildDirectChannelAttributes(
  channels: SubscriptionDirectChannel[],
  now: number,
): ProfileAttribute[] {
  const picked = ATTRIBUTE_CHANNELS.map(([kind, name]) => {
    const channel = pickChannel(channels, kind);
    return { name, channel, state: getDirectChannelState(channel) };
  });

  return [
    ...picked.flatMap(({ name, channel, state }): ProfileAttribute[] => [
      { type: "string", key: `direct_${name}_status`, value: state },
      {
        type: "number",
        key: `direct_${name}_days_left`,
        value: getDirectChannelDaysLeft(channel, now),
      },
    ]),
    {
      type: "boolean",
      key: "direct_has_problem",
      value: picked.some(({ state }) => PROBLEM_STATES.has(state)),
    },
  ];
}
