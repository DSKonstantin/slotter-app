import React from "react";
import {
  InputToolbar,
  InputToolbarProps,
  IMessage,
} from "react-native-gifted-chat";
import { colors } from "@/src/styles/colors";

const ChatInputToolbar = (props: InputToolbarProps<IMessage>) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: colors.background.surface,
        borderTopColor: colors.neutral[100],
        borderTopWidth: 1,
      }}
      primaryStyle={{ alignItems: "center" }}
    />
  );
};

export default ChatInputToolbar;
