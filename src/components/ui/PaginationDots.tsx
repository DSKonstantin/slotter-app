// PaginationDots.tsx
import React from "react";
import { Pressable, View } from "react-native";
import { twMerge } from "tailwind-merge";
import times from "lodash/times";

type Props = {
  count: number;
  activeIndex: number;
  onSelect?: (index: number) => void;
  className?: string;
};

const PaginationDots = ({ count, activeIndex, onSelect, className }: Props) => {
  return (
    <View className={twMerge("flex-row gap-2", className)}>
      {times(count, (i) => (
        <Pressable
          key={i}
          onPress={() => onSelect?.(i)}
          className={twMerge(
            "h-2 rounded-full",
            i === activeIndex ? "w-7 bg-background" : "w-2 bg-neutral-500",
          )}
        />
      ))}
    </View>
  );
};

export { PaginationDots };
