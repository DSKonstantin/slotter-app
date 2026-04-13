import React from "react";
import { Bubble, BubbleProps, IMessage } from "react-native-gifted-chat";
import { colors } from "@/src/styles/colors";

const ChatBubble = (props: BubbleProps<IMessage>) => (
  <Bubble
    {...props}
    wrapperStyle={{
      right: { backgroundColor: colors.primary.blue[500] },
      left: { backgroundColor: colors.neutral[100] },
    }}
    textStyle={{
      right: { color: colors.neutral[0] },
      left: { color: colors.neutral[900] },
    }}
  />
);

export default ChatBubble;
