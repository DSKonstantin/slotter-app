import React from "react";
import { Message, MessageProps } from "react-native-gifted-chat";
import type { ChatIMessage } from "@/src/utils/chat/types";

const ChatMessage = (props: MessageProps<ChatIMessage>) => (
  <Message
    {...props}
    containerStyle={{
      right: { marginRight: 16 },
      left: { marginLeft: 16 },
    }}
  />
);

export default ChatMessage;
