import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/src/styles/colors";

interface Props {
  progress?: number;
  isSelected?: boolean;
}

const SIZE = 44;
const STROKE_WIDTH = 2;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CircularProgressDayComponent = ({
  progress = 0.75,
  isSelected,
}: Props) => {
  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          stroke={colors.primary.blue[500]}
          strokeOpacity={0.2}
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          transform={`
              rotate(90 ${SIZE / 2} ${SIZE / 2})
              scale(-1,1)
              translate(-${SIZE},0)
          `}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
  },
});

export const CircularProgressDay = React.memo(CircularProgressDayComponent);
