import type { IMessage } from "react-native-gifted-chat";
import type {
  ChatMessageImage,
  ChatWidget,
} from "@/src/store/redux/services/api-types";

export type ChatIMessage = IMessage & {
  chatRoomId?: number;
  images?: ChatMessageImage[];
  widget?: ChatWidget | null;
  reply_to?: ChatIMessage | null;
};
