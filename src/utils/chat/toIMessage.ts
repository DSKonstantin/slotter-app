import type {
  ChatMessage,
  ChatMessageReply,
  ChatMessageReplyOwner,
  ChatRoomInterlocutor,
} from "@/src/store/redux/services/api-types";
import type { ChatIMessage } from "./types";

const DELETED_USER_ID = "deleted";
const DELETED_USER_NAME = "Удалённый пользователь";

const ownerToGiftedUser = (
  owner: ChatRoomInterlocutor | ChatMessageReplyOwner | null,
): ChatIMessage["user"] => {
  if (!owner) {
    return { _id: DELETED_USER_ID, name: DELETED_USER_NAME };
  }

  return {
    _id: `${owner.type.toLowerCase()}_${owner.id}`,
    name: owner.name,
    avatar: owner.avatar_url ?? undefined,
  };
};

const replyToIMessage = (reply: ChatMessageReply): ChatIMessage => ({
  _id: reply.id,
  text: reply.body ?? "",
  createdAt: new Date(reply.created_at).getTime(),
  user: ownerToGiftedUser(reply.owner),
});

export const toIMessage = (msg: ChatMessage): ChatIMessage => {
  const firstImage = msg.images?.[0];

  return {
    _id: msg.id,
    text: msg.body ?? "",
    createdAt: new Date(msg.created_at).getTime(),
    user: ownerToGiftedUser(msg.owner),
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
