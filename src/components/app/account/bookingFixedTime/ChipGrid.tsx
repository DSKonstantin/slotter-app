import React from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import { Badge } from "@/src/components/ui";

const COLUMN_GAP_PERCENT = 2;

type ChipGridProps<T extends string | number> = {
  items: { value: T; label: string }[];
  selected: T[];
  columns: number;
  chipClassName?: string;
  onToggle: (value: T) => void;
};

const ChipGrid = <T extends string | number>({
  items,
  selected,
  columns,
  chipClassName,
  onToggle,
}: ChipGridProps<T>) => {
  const width: `${number}%` = `${(100 - COLUMN_GAP_PERCENT * (columns - 1)) / columns}%`;

  return (
    <View className="flex-row flex-wrap gap-y-2">
      {items.map((item, index) => {
        const isSelected = selected.includes(item.value);
        const isLastInRow = (index + 1) % columns === 0;
        return (
          <Badge
            key={item.value}
            title={item.label}
            variant={isSelected ? "accent" : "secondary"}
            className={twMerge(
              !isSelected && "bg-background-surface",
              chipClassName,
            )}
            style={{
              width,
              marginRight: isLastInRow ? 0 : `${COLUMN_GAP_PERCENT}%`,
            }}
            onPress={() => onToggle(item.value)}
          />
        );
      })}
    </View>
  );
};

export default ChipGrid;
