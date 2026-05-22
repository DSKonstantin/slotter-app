import React, { memo } from "react";
import { Message, MessageProps } from "react-native-gifted-chat";
import type { ChatIMessage } from "@/src/utils/chat/types";

const CONTAINER_STYLE = {
  right: { marginRight: 16 },
  left: { marginLeft: 16 },
};

const ChatMessage = (props: MessageProps<ChatIMessage>) => (
  <Message {...props} containerStyle={CONTAINER_STYLE} />
);

export default memo(ChatMessage);
