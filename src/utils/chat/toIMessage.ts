import type {
  ChatMessage,
  ChatMessageReply,
} from "@/src/store/redux/services/api-types";
import type { ChatIMessage } from "./types";

const replyToIMessage = (reply: ChatMessageReply): ChatIMessage => ({
  _id: reply.id,
  text: reply.body ?? "",
  createdAt: new Date(reply.created_at).getTime(),
  user: {
    _id: `${reply.owner.type.toLowerCase()}_${reply.owner.id}`,
    name: reply.owner.name,
    avatar: reply.owner.avatar_url ?? undefined,
  },
});

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
    received: msg.is_read,
    pending: false,
    chatRoomId: msg.chat_room_id,
    images: msg.images,
    widget: msg.chat_widget ?? null,
    reply_to: msg.reply_to ? replyToIMessage(msg.reply_to) : null,
  };
};
