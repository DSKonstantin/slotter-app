import React from "react";
import { Send, SendProps, IMessage } from "react-native-gifted-chat";
import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const ChatSendButton = (props: SendProps<IMessage>) => (
  <Send
    {...props}
    containerStyle={{
      justifyContent: "center",
      alignItems: "center",
      width: 40,
      height: 40,
    }}
  >
    <StSvg name="Expand_right" size={24} color={colors.primary.blue[500]} />
  </Send>
);

export default ChatSendButton;
