import React from "react";
import { View } from "react-native";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type ViewerHeaderProps = {
  currentIndex: number;
  total: number;
  topInset: number;
  onClose: () => void;
};

export function ViewerHeader({
  currentIndex,
  total,
  topInset,
  onClose,
}: ViewerHeaderProps) {
  return (
    <View
      className="absolute left-4 right-4 z-10 flex-row items-center justify-between"
      style={{ top: topInset + 8 }}
    >
      <IconButton
        onPress={onClose}
        icon={
          <StSvg name="Close_round" size={24} color={colors.neutral[900]} />
        }
      />
      <Typography className="text-neutral-0 text-body">
        {currentIndex + 1} из {total}
      </Typography>
      <View className="w-10" />
    </View>
  );
}
