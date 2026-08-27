import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/src/styles/colors";

interface Props {
  progress?: number;
  size?: number;
}

const DEFAULT_SIZE = 44;
const STROKE_WIDTH = 2;

const CircularProgressDayComponent = ({
  progress = 0,
  size = DEFAULT_SIZE,
}: Props) => {
  const { radius, circumference } = useMemo(() => {
    const radius = (size - STROKE_WIDTH) / 2;
    return { radius, circumference: 2 * Math.PI * radius };
  }, [size]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          stroke={colors.primary.green[500]}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`
              rotate(90 ${size / 2} ${size / 2})
              scale(-1,1)
              translate(-${size},0)
          `}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
  },
});

export const CircularProgressDay = React.memo(CircularProgressDayComponent);
