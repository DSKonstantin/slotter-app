import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";

const RADIUS = 12;
const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";
const ITEM_H = 64;
const GAP = 8;
const COUNT = 2;

const IncomeBreakdownSkeleton = () => {
  const { width } = useWindowDimensions();
  const w = width - 40;
  const totalH = COUNT * ITEM_H + (COUNT - 1) * GAP;

  return (
    <View>
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {Array.from({ length: COUNT }).map((_, i) => (
          <Rect
            key={i}
            x={0}
            y={i * (ITEM_H + GAP)}
            rx={RADIUS}
            ry={RADIUS}
            width={w}
            height={ITEM_H}
          />
        ))}
      </ContentLoader>
    </View>
  );
};

export default IncomeBreakdownSkeleton;
