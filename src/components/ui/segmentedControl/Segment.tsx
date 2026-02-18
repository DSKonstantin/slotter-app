import React, { memo } from "react";
import { Text, TouchableOpacity } from "react-native";

type SegmentProps = {
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const Segment = ({ label, isActive, disabled, onPress }: SegmentProps) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-1 rounded-[10px] min-h-[34px] items-center justify-center
       ${isActive ? "bg-primary-blue-500" : "bg-neutral-0"}`}
    >
      <Text
        className={`font-inter-medium text-caption 
        ${isActive ? "text-neutral-0" : "text-neutral-700"} 
        ${disabled ? "text-neutral-200 opacity-50" : ""}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(Segment);
