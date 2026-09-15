import type { SubscriptionDirectChannel } from "@/src/store/redux/services/api-types";

export function isDirectChannelActive(
  channel: Pick<SubscriptionDirectChannel, "provisioning_status">,
) {
  return channel.provisioning_status === "active";
}
