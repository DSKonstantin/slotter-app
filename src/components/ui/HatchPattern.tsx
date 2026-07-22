import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, Pattern, Line, Rect } from "react-native-svg";
import { colors } from "@/src/styles/colors";

export const HatchPattern: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern
          id="hatch"
          patternUnits="userSpaceOnUse"
          width={12}
          height={12}
        >
          <Line
            x1={12}
            y1={0}
            x2={0}
            y2={12}
            stroke={colors.neutral[200]}
            strokeWidth={1}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#hatch)" />
    </Svg>
  </View>
);
