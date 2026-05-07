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
  /** Quoted parent message rendered as a bubble preview. Backend sends a stripped
   *  payload (id, body, created_at, owner); also set on optimistic messages. */
  reply_to?: ChatIMessage | null;
};
