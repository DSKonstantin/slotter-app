import React, { memo } from "react";
import { Text, TouchableOpacity } from "react-native";
import { twMerge } from "tailwind-merge";

type SegmentProps = {
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onPress: () => void;
  className?: string;
  labelClassName?: string;
};

const Segment = ({
  label,
  isActive,
  disabled,
  onPress,
  className,
  labelClassName,
}: SegmentProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={twMerge(
        "flex-1 rounded-[10px] min-h-[34px] items-center justify-center",
        isActive ? "bg-primary-blue-500" : "bg-neutral-0",
        className,
      )}
    >
      <Text
        className={twMerge(
          "font-inter-medium text-caption",
          isActive ? "text-neutral-0" : "text-neutral-700",
          disabled && "text-neutral-200 opacity-50",
          labelClassName,
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(Segment);
