import React from "react";
import { View } from "react-native";
import { Bubble, BubbleProps } from "react-native-gifted-chat";
import { colors } from "@/src/styles/colors";
import { Typography } from "@/src/components/ui";
import type { ChatIMessage } from "@/src/utils/chat/types";

const ChatBubble = (props: BubbleProps<ChatIMessage>) => {
  const { currentMessage, position } = props;
  const isRight = position === "right";

  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: colors.primary.blue[500] },
        left: { backgroundColor: colors.neutral[100] },
      }}
      textStyle={{
        right: { color: colors.neutral[0] },
        left: { color: colors.neutral[900] },
      }}
      tickStyle={{ color: isRight ? colors.neutral[0] : colors.neutral[500] }}
      // Показываем две галочки если статус read, одну если unread
      received={currentMessage?.status === "read"}
      renderCustomView={() => {
        const reply = currentMessage?.reply_to;
        if (!reply) return null;

        return (
          <View
            style={{
              borderLeftWidth: 3,
              borderLeftColor: isRight
                ? "rgba(255,255,255,0.6)"
                : colors.primary.blue[500],
              marginHorizontal: 8,
              marginTop: 8,
              paddingLeft: 8,
              paddingRight: 4,
            }}
          >
            <Typography
              weight="semibold"
              style={{
                fontSize: 11,
                color: isRight
                  ? "rgba(255,255,255,0.85)"
                  : colors.primary.blue[500],
                marginBottom: 2,
              }}
            >
              {reply.user?.name ?? ""}
            </Typography>
            <Typography
              style={{
                fontSize: 12,
                color: isRight ? "rgba(255,255,255,0.7)" : colors.neutral[600],
              }}
              numberOfLines={2}
            >
              {reply.text || "Изображение"}
            </Typography>
          </View>
        );
      }}
    />
  );
};

export default ChatBubble;
