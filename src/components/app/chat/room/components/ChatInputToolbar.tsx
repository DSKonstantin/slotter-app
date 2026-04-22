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
        backgroundColor: "transparent",
        borderTopWidth: 0,
      }}
      primaryStyle={{ alignItems: "flex-end" }}
    />
  );
};

export default ChatInputToolbar;
