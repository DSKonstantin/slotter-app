import type { IMessage } from "react-native-gifted-chat";
import type { ChatMessageFileUrl } from "@/src/store/redux/services/api-types";

export interface ChatIMessage extends IMessage {
  reply_to?: ChatIMessage | null;
  chatRoomId?: number;
  type_of?: "normal" | "system";
  file_urls?: ChatMessageFileUrl[];
  status?: "read" | "unread";
}
