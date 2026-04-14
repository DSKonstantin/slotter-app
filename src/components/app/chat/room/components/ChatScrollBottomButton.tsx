import React from "react";
import { View } from "react-native";
import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const ChatScrollBottomButton = () => (
  <View
    style={{
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    }}
  >
    <StSvg name="Expand_down" size={20} color={colors.neutral[700]} />
  </View>
);

export default ChatScrollBottomButton;
