import React from "react";
import { View } from "react-native";
import { useController } from "react-hook-form";
import { Typography } from "@/src/components/ui";
import { MOCK_WORKING_DAY, type BookingFixedTimeFormValues } from "./constants";
import { sortMinutes, toggleItem } from "./utils";
import ChipGrid from "./ChipGrid";

type FixedTimesTabProps = {
  gridItems: { value: number; label: string }[];
};

const FixedTimesTab = ({ gridItems }: FixedTimesTabProps) => {
  const { field } = useController<BookingFixedTimeFormValues, "fixedTimes">({
    name: "fixedTimes",
  });

  return (
    <View className="gap-2">
      <Typography weight="regular" className="text-caption text-neutral-500">
        Рабочий день: {MOCK_WORKING_DAY.start}–{MOCK_WORKING_DAY.end} · перерыв{" "}
        {MOCK_WORKING_DAY.breakStart}–{MOCK_WORKING_DAY.breakEnd}
      </Typography>
      <ChipGrid
        items={gridItems}
        selected={field.value}
        columns={4}
        onToggle={(time) =>
          field.onChange(sortMinutes(toggleItem(field.value, time)))
        }
      />
    </View>
  );
};

export default FixedTimesTab;
