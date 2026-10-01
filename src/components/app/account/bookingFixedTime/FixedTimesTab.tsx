import React from "react";
import { View } from "react-native";
import { useController } from "react-hook-form";
import { Typography } from "@/src/components/ui";
import { formatMinutes } from "@/src/utils/date/formatTime";
import type { TimeRange } from "@/src/utils/bookingFixedTime";
import type { BookingFixedTimeFormValues } from "./constants";
import { sortMinutes, toggleItem, type GridItem } from "./utils";
import ChipGrid from "./ChipGrid";

type FixedTimesTabProps = {
  gridItems: GridItem[];
  range: TimeRange;
};

const FixedTimesTab = ({ gridItems, range }: FixedTimesTabProps) => {
  const { field } = useController<BookingFixedTimeFormValues, "fixedTimes">({
    name: "fixedTimes",
  });

  return (
    <View className="gap-2">
      <Typography weight="regular" className="text-caption text-neutral-500">
        Границы сетки по графику: {formatMinutes(range.start)}–
        {formatMinutes(range.end)}
      </Typography>
      <ChipGrid
        items={gridItems}
        selected={field.value}
        columns={4}
        onToggle={(time) =>
          field.onChange(sortMinutes(toggleItem(field.value, time)))
        }
      />
      {gridItems.some((item) => item.muted) && (
        <Typography weight="regular" className="text-caption text-neutral-500">
          Серые времена вне графика: клиентам они не предлагаются. Нажмите,
          чтобы снять
        </Typography>
      )}
    </View>
  );
};

export default FixedTimesTab;
