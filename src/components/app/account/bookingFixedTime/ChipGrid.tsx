import React from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import { Badge } from "@/src/components/ui";

type ChipGridProps<T extends string | number> = {
  items: { value: T; label: string; muted?: boolean }[];
  selected: T[];
  columns: number;
  chipClassName?: string;
  onToggle: (value: T) => void;
};

const chunk = <T,>(list: T[], size: number) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) =>
    list.slice(i * size, (i + 1) * size),
  );

const ChipGrid = <T extends string | number>({
  items,
  selected,
  columns,
  chipClassName,
  onToggle,
}: ChipGridProps<T>) => {
  const selectedSet = new Set(selected);

  return (
    <View className="gap-y-2">
      {chunk(items, columns).map((row) => (
        <View key={row[0].value} className="flex-row gap-x-2">
          {row.map((item) => {
            const isSelected = selectedSet.has(item.value);
            return (
              <Badge
                key={item.value}
                title={item.label}
                variant={
                  isSelected ? (item.muted ? "neutral" : "accent") : "secondary"
                }
                className={twMerge(
                  "flex-1",
                  !isSelected && "bg-background-surface",
                  chipClassName,
                )}
                onPress={() => onToggle(item.value)}
              />
            );
          })}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <View key={`spacer-${i}`} className="flex-1" />
          ))}
        </View>
      ))}
    </View>
  );
};

export default ChipGrid;
