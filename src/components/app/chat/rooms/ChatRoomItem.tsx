import React from "react";
import { TouchableOpacity, View } from "react-native";
import { shallowEqual } from "react-redux";
import { Avatar, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatMessageTime } from "@/src/utils/date/formatDate";
import { useAppSelector } from "@/src/store/redux/store";
import type { ChatRoom } from "@/src/store/redux/services/api-types";

type Props = {
  room: ChatRoom;
  onPress: (room: ChatRoom) => void;
};

const ChatRoomItem = ({ room, onPress }: Props) => {
  const { interlocutor, unread_count, last_activity_at, last_message } = room;
  const { currentUserId, resourceType } = useAppSelector(
    (s) => ({
      currentUserId: s.auth.user?.id,
      resourceType: s.auth.resourceType,
    }),
    shallowEqual,
  );

  if (!interlocutor) return null;
  const hasUnread = unread_count > 0;

  const previewText = (() => {
    if (!last_message) return "";
    const isMine =
      !!currentUserId &&
      !!resourceType &&
      last_message.owner.id === currentUserId &&
      last_message.owner.type.toLowerCase() === resourceType;
    const body = last_message.body?.trim() || "Вложение";
    return isMine ? `Вы: ${body}` : body;
  })();

  const timestamp = last_message?.created_at ?? last_activity_at;

  return (
    <TouchableOpacity
      onPress={() => onPress(room)}
      activeOpacity={0.7}
      className="flex-row items-center gap-2 p-4 bg-background-surface rounded-base"
    >
      <Avatar
        name={interlocutor.name}
        uri={interlocutor.avatar_url ?? undefined}
        size="md"
      />

      <View className="flex-1 gap-0.5">
        <View className="flex-row justify-between items-center gap-2">
          <Typography
            weight="semibold"
            className="flex-1 text-neutral-900 text-body"
            numberOfLines={1}
          >
            {interlocutor.name}
          </Typography>

          <Typography
            weight="regular"
            className="shrink-0 text-neutral-500 text-caption"
          >
            {formatMessageTime(timestamp)}
          </Typography>
        </View>

        <View className="flex-row justify-between items-center gap-2 h-[20px]">
          <Typography
            weight="regular"
            className="flex-1 text-neutral-500 text-caption"
            numberOfLines={1}
          >
            {previewText}
          </Typography>

          {hasUnread && (
            <View
              className="min-w-[20px] w-[20px] h-[20px] rounded-full items-center justify-center"
              style={{ backgroundColor: colors.neutral[900] }}
            >
              <Typography
                weight="regular"
                className="text-neutral-0 text-caption"
              >
                {unread_count > 99 ? "99+" : String(unread_count)}
              </Typography>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatRoomItem;
