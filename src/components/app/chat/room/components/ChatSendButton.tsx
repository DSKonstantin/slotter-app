import React from "react";
import { Pressable } from "react-native";
import type { SendProps, IMessage } from "react-native-gifted-chat";
import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const ChatSendButton = ({ text, onSend }: SendProps<IMessage>) => {
  const hasText = !!text?.trim();

  const handlePress = () => {
    if (hasText && onSend) {
      onSend({ text: text!.trim() } as IMessage, true);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!hasText}
      className="self-end justify-center items-center w-[48px] h-[48px] rounded-full active:opacity-70 bg-background-surface"
      style={!hasText ? { opacity: 0.3 } : undefined}
    >
      <StSvg name="Arrow_top" size={20} color={colors.neutral[900]} />
    </Pressable>
  );
};

export default ChatSendButton;
