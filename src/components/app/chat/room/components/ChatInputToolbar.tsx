import React from "react";
import {
  InputToolbar,
  InputToolbarProps,
  IMessage,
} from "react-native-gifted-chat";
import { Platform } from "react-native";

const ChatInputToolbar = (props: InputToolbarProps<IMessage>) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: "transparent",
        borderTopWidth: 0,
        ...(Platform.OS === "android" && { paddingBottom: 8 }),
      }}
      primaryStyle={{ alignItems: "flex-end" }}
    />
  );
};

export default ChatInputToolbar;
