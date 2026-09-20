import React, { memo } from "react";
import { Pressable, View } from "react-native";
import { Bubble, BubbleProps } from "react-native-gifted-chat";
import { colors } from "@/src/styles/colors";
import { StSvg, Typography } from "@/src/components/ui";
import type { ChatIMessage } from "@/src/utils/chat/types";

type ChatBubbleProps = BubbleProps<ChatIMessage> & {
  onRetryFailed?: (message: ChatIMessage) => void;
};

const WRAPPER_STYLE = {
  right: { backgroundColor: colors.primary.blue[500] },
  left: { backgroundColor: colors.neutral[0] },
};

const TEXT_STYLE = {
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
};

const TICK_PADDING = { paddingLeft: 4 };

const ChatBubble = ({ onRetryFailed, ...props }: ChatBubbleProps) => {
  const { currentMessage, position } = props;
  const isRight = position === "right";
  const isRead = !!currentMessage?.received;
  const isFailed = !!currentMessage?.failed;
  const reply = currentMessage?.reply_to;

  return (
    <Bubble
      {...props}
      wrapperStyle={WRAPPER_STYLE}
      textStyle={TEXT_STYLE}
      renderTicks={() => {
        if (!isRight) return null;
        if (isFailed) {
          return (
            <Pressable
              style={TICK_PADDING}
              hitSlop={10}
              onPress={() => currentMessage && onRetryFailed?.(currentMessage)}
              accessibilityLabel="Повторить отправку"
            >
              <StSvg
                name="Refresh_2"
                size={14}
                color={colors.accent.red[500]}
              />
            </Pressable>
          );
        }
        return (
          <View style={TICK_PADDING}>
            <StSvg
              name={isRead ? "Done_all_round" : "Done_round"}
              size={14}
              color={colors.neutral[0]}
            />
          </View>
        );
      }}
      renderCustomView={() => {
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

export default memo(ChatBubble);
