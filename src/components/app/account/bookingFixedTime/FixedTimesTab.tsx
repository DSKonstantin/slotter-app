import React from "react";
import { View } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { Typography } from "@/src/components/ui";
import { MOCK_WORKING_DAY, type BookingFixedTimeFormValues } from "./constants";
import { sortMinutes, toggleItem } from "./utils";
import ChipGrid from "./ChipGrid";

type FixedTimesTabProps = {
  gridItems: { value: number; label: string }[];
};

const FixedTimesTab = ({ gridItems }: FixedTimesTabProps) => {
  const { control, setValue } = useFormContext<BookingFixedTimeFormValues>();
  const fixedTimes = useWatch({ control, name: "fixedTimes" });

  const handleToggle = (time: number) =>
    setValue("fixedTimes", sortMinutes(toggleItem(fixedTimes, time)), {
      shouldDirty: true,
    });

  return (
    <View className="gap-2">
      <Typography weight="regular" className="text-caption text-neutral-500">
        Рабочий день: {MOCK_WORKING_DAY.start}–{MOCK_WORKING_DAY.end} · перерыв{" "}
        {MOCK_WORKING_DAY.breakStart}–{MOCK_WORKING_DAY.breakEnd}
      </Typography>
      <ChipGrid
        items={gridItems}
        selected={fixedTimes}
        columns={4}
        chipClassName="rounded-full"
        onToggle={handleToggle}
      />
    </View>
  );
};

export default FixedTimesTab;
