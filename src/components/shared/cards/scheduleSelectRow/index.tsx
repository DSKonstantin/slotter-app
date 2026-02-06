import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { PresetDateDropdown } from "@/src/components/shared/dropdowns/presetDateDropdown";
import { ItemType } from "react-native-dropdown-picker";
import { useRouter } from "expo-router";
import { Routers } from "@/src/constants/routers";

const PRESET_DATE_ITEMS = [
  { label: "Сегодня", value: "today" },
  { label: "Завтра", value: "tomorrow" },
  { label: "Послезавтра", value: "after_tomorrow" },
] satisfies ItemType<string>[];

const ScheduleSelectRow = () => {
  const router = useRouter();
  const [date, setDate] = useState<string>("tomorrow");

  const handleChange = useCallback(
    (value: string | null) => {
      if (!value) return;

      setDate(value);

      router.push({
        pathname: Routers.tabs.calendar,
        params: {
          date: value,
        },
      });
    },
    [router],
  );

  return (
    <View className="flex-row justify-between items-center bg-background-card rounded-base p-4">
      <View className="flex-row items-center gap-1">
        <Typography weight="semibold" className="text-body">
          Открыть расписание на
        </Typography>

        <PresetDateDropdown
          value={date}
          items={PRESET_DATE_ITEMS}
          onChange={handleChange}
        />
      </View>
      <StSvg name="Expand_right_light" size={24} color={colors.neutral[500]} />
    </View>
  );
};

export default ScheduleSelectRow;
