import React from "react";
import { View } from "react-native";
import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const ChatScrollBottomButton = () => (
  <View
    className="w-9 h-9 rounded-full bg-background-surface items-center justify-center"
    style={{
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
