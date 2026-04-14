import { useEffect } from "react";
import { useAnyCable } from "@/src/contexts/AnyCableContext";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { chatActions } from "@/src/store/redux/slices/chatSlice";
import { toIMessage } from "@/src/utils/chat/toIMessage";
import type { ChatMessage } from "@/src/store/redux/services/api-types";

type RoomEvent =
  | { event: "message_created"; chat_message: ChatMessage }
  | { event: "message_destroyed"; message_id: number }
  | { event: "typing"; user: { id: number; resource_type: string } };

export function useChatRoomChannel(roomId: number) {
  const cable = useAnyCable();
  const dispatch = useAppDispatch();
  const currentGiftedId = useAppSelector((s) => {
    const { user, resourceType } = s.auth;
    return user && resourceType ? `${resourceType}_${user.id}` : null;
  });

  useEffect(() => {
    if (!cable || !roomId) return;

    // Подписка на канал автоматически регистрирует presence
    const subscription = cable.subscribeTo("ChatRoomChannel", {
      room_id: roomId,
    });
    let typingTimer: ReturnType<typeof setTimeout> | null = null;

    subscription.on("message", (raw: unknown) => {
      const data = raw as RoomEvent;

      switch (data.event) {
        case "message_created": {
          const { chat_message } = data;
          const senderId = `${chat_message.user.resource_type}_${chat_message.user.id}`;
          if (senderId !== currentGiftedId) {
            dispatch(
              chatActions.pushMessage({
                roomId,
                message: toIMessage(chat_message),
              }),
            );
          }
          break;
        }
        case "message_destroyed": {
          dispatch(
            chatActions.removeMessage({
              roomId,
              messageId: data.message_id,
            }),
          );
          break;
        }
        case "typing": {
          dispatch(chatActions.setTyping({ roomId, isTyping: true }));
          if (typingTimer) clearTimeout(typingTimer);
          typingTimer = setTimeout(() => {
            dispatch(chatActions.setTyping({ roomId, isTyping: false }));
          }, 5000);
          break;
        }
      }
    });

    return () => {
      subscription.disconnect();
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [cable, roomId, dispatch, currentGiftedId]);
}
