import type { SubscriptionDirectChannel } from "@/src/store/redux/services/api-types";

export function isDirectChannelActive(
  channel: Pick<SubscriptionDirectChannel, "status" | "provisioning_status">,
) {
  return (
    channel.status === "active" && channel.provisioning_status === "active"
  );
}
