import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Avatar, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatMessageTime } from "@/src/utils/date/formatDate";
import type { ChatRoom } from "@/src/store/redux/services/api-types";

type Props = {
  room: ChatRoom;
  onPress: (room: ChatRoom) => void;
};

const ChatRoomItem = ({ room, onPress }: Props) => {
  const { other_member, last_message, unread_count } = room;
  if (!other_member) return null;
  const hasUnread = unread_count > 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(room)}
      activeOpacity={0.7}
      className="flex-row items-center gap-2 p-4 bg-background-surface rounded-base"
    >
      <Avatar
        name={other_member.name}
        uri={other_member.avatar_url ?? undefined}
        size="md"
      />

      <View className="flex-1 gap-0.5">
        <View className="flex-row justify-between items-center">
          <Typography
            weight="semibold"
            className="text-neutral-900 text-body"
            numberOfLines={1}
          >
            {other_member.name}
          </Typography>

          {last_message && (
            <Typography
              weight="regular"
              className="text-neutral-500 text-caption"
            >
              {formatMessageTime(last_message.created_at)}
            </Typography>
          )}
        </View>

        <View className="flex-row justify-between items-center h-[20px]">
          <Typography
            weight="regular"
            className="text-neutral-500 text-caption"
            numberOfLines={1}
          >
            {last_message?.body ?? "Нет сообщений"}
          </Typography>

          {hasUnread ? (
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
          ) : (
            last_message?.is_mine &&
            (last_message.status === "read" ? (
              <StSvg
                name="Done_all_round"
                size={20}
                color={colors.primary.blue[500]}
              />
            ) : (
              <StSvg name="Done_round" size={20} color={colors.neutral[400]} />
            ))
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatRoomItem;
