import type { IMessage } from "react-native-gifted-chat";
import type {
  ChatMessageImage,
  ChatWidget,
} from "@/src/store/redux/services/api-types";

export type ChatIMessage = IMessage & {
  chatRoomId?: number;
  images?: ChatMessageImage[];
  /** Embedded widget — service_card or appointment_proposal. Comes from backend
   *  Chat::WidgetBlueprint; absent on plain text/image messages. */
  widget?: ChatWidget | null;
  /** Local-only: set on optimistic messages to show a quote bubble. Not persisted by backend. */
  reply_to?: ChatIMessage | null;
};
