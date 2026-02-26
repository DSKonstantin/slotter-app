import React from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";

import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type PhotoPreviewProps = {
  uri: string;
  radius: number;
  onRemove: () => void;
};

const PhotoPreview = ({ uri, radius, onRemove }: PhotoPreviewProps) => {
  return (
    <View className="relative">
      <Image
        source={{ uri }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius,
        }}
        contentFit="cover"
      />

      <Pressable
        onPress={onRemove}
        hitSlop={10}
        className="absolute -top-2 -right-2 rounded-full w-[24px] h-[24px] bg-white items-center justify-center"
      >
        <StSvg
          name="Close_round_fill_light"
          size={18}
          color={colors.neutral[900]}
        />
      </Pressable>
    </View>
  );
};

export default PhotoPreview;
