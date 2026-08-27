import React from "react";
import {
  InputToolbar,
  InputToolbarProps,
  IMessage,
} from "react-native-gifted-chat";

const ChatInputToolbar = (props: InputToolbarProps<IMessage>) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: "transparent",
        borderTopWidth: 0,
        paddingBottom: 8,
      }}
      primaryStyle={{ alignItems: "flex-end" }}
    />
  );
};

export default ChatInputToolbar;
