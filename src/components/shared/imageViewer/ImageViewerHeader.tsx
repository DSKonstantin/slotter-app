import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  currentIndex: number;
  total: number;
  onClose: () => void;
};

const ImageViewerHeader = ({ currentIndex, total, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="absolute left-4 right-4 z-10 flex-row items-center justify-between"
      style={{ top: insets.top + 8 }}
    >
      <IconButton
        onPress={onClose}
        icon={<StSvg name="Close_round" size={24} color={colors.neutral[900]} />}
      />
      <Typography className="text-neutral-0 text-body">
        {currentIndex + 1} из {total}
      </Typography>
      <View className="w-10" />
    </View>
  );
};

export default ImageViewerHeader;
