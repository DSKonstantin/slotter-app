import type { IMessage } from "react-native-gifted-chat";
import type {
  ChatMessageImageUrl,
  ChatMessageWidgetAppointment,
} from "@/src/store/redux/services/api-types";

export interface ChatIMessage extends IMessage {
  reply_to?: ChatIMessage | null;
  chatRoomId?: number;
  type_of?: "normal" | "system";
  image_urls?: ChatMessageImageUrl[];
  appointment?: ChatMessageWidgetAppointment | null;
  status?: "read" | "unread";
}
