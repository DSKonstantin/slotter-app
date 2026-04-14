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
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background.surface,
      borderTopWidth: 1,
      borderTopColor: colors.neutral[100],
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 10,
    }}
  >
    <StSvg name="Chat_plus_fill" size={18} color={colors.primary.blue[500]} />

    <View style={{ flex: 1 }}>
      <Typography
        weight="semibold"
        style={{
          fontSize: 12,
          color: colors.primary.blue[500],
          marginBottom: 1,
        }}
      >
        {message.user?.name ?? ""}
      </Typography>
      <Typography
        style={{ fontSize: 13, color: colors.neutral[600] }}
        numberOfLines={1}
      >
        {message.text || "Изображение"}
      </Typography>
    </View>

    <Pressable onPress={onCancel} hitSlop={8}>
      <StSvg name="Close_round_light" size={20} color={colors.neutral[500]} />
    </Pressable>
  </View>
);

export default ChatReplyFooter;
