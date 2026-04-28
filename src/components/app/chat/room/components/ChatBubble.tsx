import React from "react";
import { View } from "react-native";
import { Bubble, BubbleProps } from "react-native-gifted-chat";
import { colors } from "@/src/styles/colors";
import { StSvg, Typography } from "@/src/components/ui";
import type { ChatIMessage } from "@/src/utils/chat/types";
const ChatBubble = (props: BubbleProps<ChatIMessage>) => {
  const { currentMessage, position } = props;
  const isRight = position === "right";
  const isRead = false; // read status is tracked per-room, not per-message

  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: colors.primary.blue[500] },
        left: { backgroundColor: colors.neutral[0] },
      }}
      textStyle={{
        right: {
          color: colors.neutral[0],
          fontSize: 16,
          fontFamily: "Inter_400Regular",
        },
        left: {
          color: colors.neutral[900],
          fontSize: 16,
          fontFamily: "Inter_400Regular",
        },
      }}
      renderTicks={() =>
        isRight ? (
          <View style={{ paddingLeft: 4 }}>
            <StSvg
              name={isRead ? "Done_all_round" : "Done_round"}
              size={14}
              color={colors.neutral[0]}
            />
          </View>
        ) : null
      }
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
