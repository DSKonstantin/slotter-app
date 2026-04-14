import type { ChatMessage } from "@/src/store/redux/services/api-types";
import type { ChatIMessage } from "./types";

export const toIMessage = (msg: ChatMessage): ChatIMessage => ({
  _id: msg.id,
  text: msg.body ?? msg.decorated_body ?? "",
  createdAt: new Date(msg.created_at).getTime(),
  user: {
    _id: `${msg.user.resource_type}_${msg.user.id}`,
    name: msg.user.name,
    avatar: msg.user.avatar_url ?? undefined,
  },
  image: msg.file_urls?.[0]?.url,
  system: msg.type_of === "system",
  sent: true,
  pending: false,
  // custom fields
  reply_to: msg.reply_to ? toIMessage(msg.reply_to) : null,
  chatRoomId: msg.chat_room_id,
  type_of: msg.type_of,
  file_urls: msg.file_urls,
  status: msg.status,
});
