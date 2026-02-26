import React from "react";
import { View } from "react-native";

import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type EmptySlotProps = {
  variant: "title" | "other";
};

const EmptySlot = ({ variant }: EmptySlotProps) => {
  return (
    <View
      className="border border-neutral-500 border-dashed rounded-small justify-center items-center"
      style={{
        height: variant === "title" ? 123 : 58,
      }}
    >
      <View className="items-center justify-center">
        <StSvg
          name="Add_ring_fill_light"
          size={variant === "title" ? 40 : 24}
          color={colors.neutral[400]}
        />
      </View>
    </View>
  );
};

export default EmptySlot;
