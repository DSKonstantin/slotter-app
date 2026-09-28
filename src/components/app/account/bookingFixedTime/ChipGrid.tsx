import React from "react";
import { View } from "react-native";
import { Button } from "@/src/components/ui";

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
          <Button
            key={item.value}
            title={item.label}
            size="sm"
            variant={isSelected ? "accent" : "secondary"}
            buttonClassName={`px-0 ${chipClassName ?? ""}`}
            buttonProps={{
              style: {
                width,
                marginRight: isLastInRow ? 0 : `${COLUMN_GAP_PERCENT}%`,
              },
            }}
            textClassName={`font-inter-regular ${isSelected ? "" : "text-neutral-900"}`}
            onPress={() => onToggle(item.value)}
          />
        );
      })}
    </View>
  );
};

export default ChipGrid;
