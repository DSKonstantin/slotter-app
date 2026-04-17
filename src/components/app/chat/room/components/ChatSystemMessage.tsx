import React from "react";
import { View } from "react-native";
import { SystemMessageProps } from "react-native-gifted-chat";
import { Typography } from "@/src/components/ui";
import type { ChatIMessage } from "@/src/utils/chat/types";

const ChatSystemMessage = ({
  currentMessage,
}: SystemMessageProps<ChatIMessage>) => {
  if (!currentMessage?.text) return null;

  return (
    <View className="items-center my-2 px-6">
      <View className="bg-neutral-200 rounded-xl px-3 py-[5px]">
        <Typography className="text-xs text-neutral-600 text-center">
          {currentMessage.text}
        </Typography>
      </View>
    </View>
  );
};

export default ChatSystemMessage;
