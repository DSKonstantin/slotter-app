import React from "react";
import { Platform, View } from "react-native";
import { Typography } from "@/src/components/ui";

const ChatEmptyState = () => (
  <View className="flex-1 items-center justify-center gap-1.5">
    <View
      style={{
        transform:
          Platform.OS === "android" ? [{ scale: -1 }] : [{ scaleY: -1 }],
      }}
    >
      <Typography
        weight="semibold"
        className="text-body text-neutral-900 text-center"
      >
        Начните переписку
      </Typography>
      <Typography className="text-caption text-neutral-500 text-center">
        Напишите первое сообщение
      </Typography>
    </View>
  </View>
);

export default ChatEmptyState;
