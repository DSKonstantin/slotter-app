import type { ChatMessage } from "@/src/store/redux/services/api-types";
import type { ChatIMessage } from "./types";

export const toIMessage = (msg: ChatMessage): ChatIMessage => {
  // Normalize to lowercase to match auth.resourceType ("user" | "customer")
  const giftedOwnerId = `${msg.owner.type.toLowerCase()}_${msg.owner.id}`;
  const firstImage = msg.images?.[0];

  return {
    _id: msg.id,
    text: msg.body ?? "",
    createdAt: new Date(msg.created_at).getTime(),
    user: {
      _id: giftedOwnerId,
      name: msg.owner.name,
      avatar: msg.owner.avatar_url ?? undefined,
    },
    image: firstImage?.url,
    system: false,
    sent: true,
    pending: false,
    chatRoomId: msg.chat_room_id,
    images: msg.images,
    widget: msg.widget ?? null,
  };
};
