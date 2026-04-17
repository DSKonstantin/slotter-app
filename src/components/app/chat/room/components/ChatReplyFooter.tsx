import React from "react";
import { View, Pressable } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { ChatIMessage } from "@/src/utils/chat/types";

type Props = {
  message: ChatIMessage;
  onCancel: () => void;
};

const ChatReplyFooter = ({ message, onCancel }: Props) => (
  <View className="flex-row items-center bg-background-surface border-t border-neutral-100 px-4 py-2 gap-2.5">
    <StSvg name="Chat_plus_fill" size={18} color={colors.primary.blue[500]} />

    <View className="flex-1">
      <Typography
        weight="semibold"
        className="text-[12px] text-primary-blue-500 mb-px"
      >
        {message.user?.name ?? ""}
      </Typography>
      <Typography className="text-[13px] text-neutral-600" numberOfLines={1}>
        {message.text || "Изображение"}
      </Typography>
    </View>

    <Pressable onPress={onCancel} hitSlop={8}>
      <StSvg name="Close_round_light" size={20} color={colors.neutral[500]} />
    </Pressable>
  </View>
);

export default ChatReplyFooter;
