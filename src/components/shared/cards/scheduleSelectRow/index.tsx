import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
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

  const handleNavigate = useCallback(() => {
    router.push({
      pathname: Routers.tabs.calendar,
      params: { date },
    });
  }, [date, router]);

  return (
    <View className="flex-row justify-between items-center bg-background-card rounded-base">
      <Pressable onPress={handleNavigate} className="py-4 pl-4 mr-1">
        <Typography weight="semibold" className="text-body">
          Открыть расписание на
        </Typography>
      </Pressable>

      <PresetDateDropdown
        value={date}
        items={PRESET_DATE_ITEMS}
        onChange={handleChange}
      />
      <Pressable
        onPress={handleNavigate}
        className="p-4 flex-1 items-end justify-center"
      >
        <StSvg
          name="Expand_right_light"
          size={24}
          color={colors.neutral[500]}
        />
      </Pressable>
    </View>
  );
};

export default ScheduleSelectRow;
