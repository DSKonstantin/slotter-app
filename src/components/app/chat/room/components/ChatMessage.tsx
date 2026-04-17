import React from "react";
import { Message, MessageProps } from "react-native-gifted-chat";
import type { ChatIMessage } from "@/src/utils/chat/types";

const ChatMessage = (props: MessageProps<ChatIMessage>) => (
  <Message
    {...props}
    containerStyle={{
      right: { marginRight: 20 },
      left: { marginLeft: 20 },
    }}
  />
);

export default ChatMessage;
