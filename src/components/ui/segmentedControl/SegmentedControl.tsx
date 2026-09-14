import React, { memo } from "react";
import { View } from "react-native";
import Segment from "./Segment";
import { SegmentedControlProps } from "./SegmentedControl.types";
import { twMerge } from "tailwind-merge";

const SegmentedControl = ({
  options,
  value,
  className = "",
  segmentClassName,
  segmentLabelClassName,
  activeSegmentClassName,
  inactiveSegmentClassName,
  onChange,
}: SegmentedControlProps) => {
  return (
    <View
      className={twMerge(
        "flex-row rounded-xl bg-background-surface p-[2px]",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Segment
            key={option.value}
            label={option.label}
            disabled={option.disabled}
            isActive={isActive}
            onPress={() => onChange(option.value)}
            className={twMerge(
              segmentClassName,
              isActive ? activeSegmentClassName : inactiveSegmentClassName,
            )}
            labelClassName={segmentLabelClassName}
          />
        );
      })}
    </View>
  );
};

export default memo(SegmentedControl);
