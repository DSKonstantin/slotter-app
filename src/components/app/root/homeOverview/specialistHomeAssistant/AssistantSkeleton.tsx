import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";
const RADIUS = 8;
const H_PAD = 40;

const AssistantSkeleton = () => {
  const { width } = useWindowDimensions();
  const w = width - H_PAD;

  return (
    <View>
      <ContentLoader
        speed={SPEED}
        width={w}
        height={50}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        <Rect x={0} y={0} rx={RADIUS} ry={RADIUS} width={w * 0.85} height={18} />
        <Rect x={0} y={28} rx={RADIUS} ry={RADIUS} width={w * 0.6} height={18} />
      </ContentLoader>
    </View>
  );
};

export default AssistantSkeleton;
