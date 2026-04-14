import React from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const ChatEmptyState = () => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingBottom: 80,
      transform: [{ scaleY: -1 }], // GiftedChat inverts the list
    }}
  >
    <Typography weight="semibold" style={{ color: colors.neutral[900] }}>
      Начните переписку
    </Typography>
    <Typography style={{ fontSize: 13, color: colors.neutral[500] }}>
      Напишите первое сообщение
    </Typography>
  </View>
);

export default ChatEmptyState;
