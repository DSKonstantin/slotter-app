import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useAppDispatch } from "@/src/store/redux/store";
import { setFilterModalOpen } from "@/src/store/redux/slices/calendarSlice";
import Svg, { Defs, Pattern, Line, Rect } from "react-native-svg";

const HatchPattern: React.FC = () => (
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

const FilteredSlotBlock: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="relative flex-1 rounded-base flex-row items-center overflow-hidden border border-neutral-200 bg-background px-4 mb-1"
      onPress={() => dispatch(setFilterModalOpen(true))}
    >
      <HatchPattern />
      <View className="items-center flex-row">
        <StSvg name="View_hide_fill" size={24} color={colors.neutral[900]} />
        <Typography className="text-body text-neutral-900">Скрыто</Typography>
      </View>
    </TouchableOpacity>
  );
};

export default FilteredSlotBlock;
