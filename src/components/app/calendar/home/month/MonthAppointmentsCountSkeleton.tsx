import React from "react";
import { View } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";

const WIDTH = 74;
const HEIGHT = 18;
const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const MonthAppointmentsCountSkeleton = () => {
  return (
    <View style={{ width: WIDTH, height: HEIGHT }}>
      <ContentLoader
        speed={SPEED}
        width={WIDTH}
        height={HEIGHT}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        <Rect x={0} y={2} rx={8} ry={8} width={WIDTH} height={14} />
      </ContentLoader>
    </View>
  );
};

export default MonthAppointmentsCountSkeleton;
