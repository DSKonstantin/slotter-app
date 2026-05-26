import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

export type SchedulePreset = {
  id: string;
  label: string;
  time: string;
  days: string[];
  startAt: string;
  endAt: string;
};

export const SCHEDULE_PRESETS: SchedulePreset[] = [
  {
    id: "mon_fri",
    label: "Пн — Пт",
    time: "9:00 – 18:00",
    days: ["mon", "tue", "wed", "thu", "fri"],
    startAt: "09:00",
    endAt: "18:00",
  },
  {
    id: "mon_sat",
    label: "Пн — Сб",
    time: "10:00 – 20:00",
    days: ["mon", "tue", "wed", "thu", "fri", "sat"],
    startAt: "10:00",
    endAt: "20:00",
  },
  {
    id: "daily",
    label: "Ежедневно",
    time: "10:00 – 19:00",
    days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    startAt: "10:00",
    endAt: "19:00",
  },
  {
    id: "sat_sun",
    label: "Сб — Вс",
    time: "11:00 – 20:00",
    days: ["sat", "sun"],
    startAt: "11:00",
    endAt: "20:00",
  },
];

type SchedulePresetsProps = {
  selectedId: string | null;
  onSelect: (preset: SchedulePreset) => void;
};

export function SchedulePresets({
  selectedId,
  onSelect,
}: SchedulePresetsProps) {
  return (
    <View className="gap-2">
      <Typography className="text-caption text-neutral-500 px-screen">
        Типовой график
      </Typography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: SCREEN_PADDING }}
      >
        {SCHEDULE_PRESETS.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              onPress={() => onSelect(preset)}
              activeOpacity={0.7}
              className={`p-4 bg-background-surface rounded-base gap-1 border ${isSelected ? "border-neutral-100" : "border-transparent"}`}
              style={{ minWidth: 120 }}
            >
              <Typography
                className="text-body"
                style={{
                  color: isSelected
                    ? colors.primary.blue[500]
                    : colors.neutral[900],
                }}
              >
                {preset.label}
              </Typography>
              <Typography className="text-caption color-neutral-500">
                {preset.time}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
