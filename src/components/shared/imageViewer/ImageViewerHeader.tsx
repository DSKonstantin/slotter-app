import React from "react";
import { View } from "react-native";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { TopGradientBar } from "./TopGradientBar";

type Props = {
  currentIndex: number;
  total: number;
  onClose: () => void;
};

const ImageViewerHeader = ({ currentIndex, total, onClose }: Props) => (
  <TopGradientBar>
    <View className="flex-row items-center justify-between">
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
  </TopGradientBar>
);

export default ImageViewerHeader;
