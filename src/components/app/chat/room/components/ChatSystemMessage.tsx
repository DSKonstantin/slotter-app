import React from "react";
import { View } from "react-native";
import { SystemMessageProps } from "react-native-gifted-chat";
import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { ChatIMessage } from "@/src/utils/chat/types";

const ChatSystemMessage = ({ currentMessage }: SystemMessageProps<ChatIMessage>) => {
  if (!currentMessage?.text) return null;

  return (
    <View
      style={{
        alignItems: "center",
        marginVertical: 8,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          backgroundColor: colors.neutral[200],
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 5,
        }}
      >
        <Typography
          style={{
            fontSize: 12,
            color: colors.neutral[600],
            textAlign: "center",
          }}
        >
          {currentMessage.text}
        </Typography>
      </View>
    </View>
  );
};

export default ChatSystemMessage;
