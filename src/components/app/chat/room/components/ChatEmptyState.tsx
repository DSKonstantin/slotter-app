import React from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";

const ChatEmptyState = () => (
  <View
    className="flex-1 items-center justify-center gap-1.5 pb-20"
    style={{ transform: [{ scaleY: -1 }] }}
  >
    <Typography weight="semibold" className="text-body text-neutral-900">
      Начните переписку
    </Typography>
    <Typography className="text-caption text-neutral-500">
      Напишите первое сообщение
    </Typography>
  </View>
);

export default ChatEmptyState;
