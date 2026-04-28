import { getCable, type CableSubscription } from "@/src/services/cable";
import type {
  RoomChannelEvent,
  ResourceChannelEvent,
} from "@/src/store/redux/services/api-types";

export function subscribeToResource(
  token: string | null,
): CableSubscription<ResourceChannelEvent> | null {
  const cable = getCable(token);
  if (!cable) return null;
  return cable.subscribeTo<ResourceChannelEvent>("ResourceChannel");
}

export function subscribeToChatRoom(
  token: string | null,
  roomId: number,
): CableSubscription<RoomChannelEvent> | null {
  const cable = getCable(token);
  if (!cable) return null;
  return cable.subscribeTo<RoomChannelEvent>("Chat::RoomChannel", {
    room_id: roomId,
  });
}
