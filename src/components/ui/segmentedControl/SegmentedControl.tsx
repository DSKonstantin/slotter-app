import React, { memo } from "react";
import { View } from "react-native";
import Segment from "./Segment";
import { SegmentedControlProps } from "./SegmentedControl.types";

const SegmentedControl = ({
  options,
  value,
  className = "",
  onChange,
}: SegmentedControlProps) => {
  return (
    <View
      className={`
        flex-row 
        rounded-xl 
        bg-background-surface 
        p-[2px] 
        ${className}
      `}
    >
      {options.map((option) => (
        <Segment
          key={option.value}
          label={option.label}
          disabled={option.disabled}
          isActive={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
};

export default memo(SegmentedControl);
