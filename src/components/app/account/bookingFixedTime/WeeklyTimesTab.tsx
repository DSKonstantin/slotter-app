import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { Divider, StSvg, Tag, Typography } from "@/src/components/ui";
import { days as WEEK_DAYS } from "@/src/constants/days";
import { formatMinutes } from "@/src/utils/date/formatTime";
import { colors } from "@/src/styles/colors";
import type { BookingFixedTimeFormValues, DayId } from "./constants";
import { EMPTY_TIMES, toggleItem } from "./utils";
import ChipGrid from "./ChipGrid";
import ScheduleHint from "./ScheduleHint";
import DayTimesModal from "./DayTimesModal";

const DAY_ITEMS = WEEK_DAYS.map((day) => ({ value: day.id, label: day.label }));

type WeeklyTimesTabProps = {
  gridItems: { value: number; label: string }[];
};

const WeeklyTimesTab = ({ gridItems }: WeeklyTimesTabProps) => {
  const [editingDay, setEditingDay] = useState<DayId | null>(null);

  const { control, getValues, setValue } =
    useFormContext<BookingFixedTimeFormValues>();
  const [selectedDays, dayTimes] = useWatch({
    control,
    name: ["days", "dayTimes"],
  });

  const visibleDays = useMemo(
    () => WEEK_DAYS.filter((day) => selectedDays.includes(day.id)),
    [selectedDays],
  );
  const editingDayLabel = useMemo(
    () => WEEK_DAYS.find((day) => day.id === editingDay)?.fullLabel ?? "",
    [editingDay],
  );

  const handleDayToggle = (day: DayId) => {
    const next = toggleItem(selectedDays, day);
    setValue(
      "days",
      WEEK_DAYS.map((d) => d.id).filter((id) => next.includes(id)),
      { shouldDirty: true },
    );
  };

  const handleDayTimesConfirm = (times: number[]) => {
    if (editingDay === null) return;
    setValue(
      "dayTimes",
      { ...getValues("dayTimes"), [editingDay]: times },
      { shouldDirty: true },
    );
    setEditingDay(null);
  };

  return (
    <View className="gap-3">
      <Typography weight="regular" className="text-caption text-neutral-500">
        Выберите дни, в которые будет доступна онлайн-запись
      </Typography>
      <ChipGrid
        items={DAY_ITEMS}
        selected={selectedDays}
        columns={5}
        chipClassName="rounded-small"
        onToggle={handleDayToggle}
      />

      <ScheduleHint />

      {visibleDays.length > 0 && (
        <View className="bg-background-surface rounded-base">
          {visibleDays.map((day, index) => {
            const times = dayTimes[day.id] ?? EMPTY_TIMES;
            return (
              <View key={day.id}>
                {index > 0 && <Divider className="mx-4 w-auto" />}
                <Pressable
                  className="p-4 gap-3 active:opacity-70"
                  onPress={() => setEditingDay(day.id)}
                >
                  <View className="flex-row items-center justify-between">
                    <Typography className="text-body text-neutral-900">
                      {day.fullLabel}
                    </Typography>
                    <StSvg
                      name={times.length ? "Edit_light" : "Expand_right"}
                      size={20}
                      color={colors.neutral[400]}
                    />
                  </View>
                  {times.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerClassName="gap-2"
                    >
                      {times.map((time) => (
                        <Tag key={time} title={formatMinutes(time)} size="sm" />
                      ))}
                    </ScrollView>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <DayTimesModal
        visible={editingDay !== null}
        title={editingDayLabel}
        items={gridItems}
        value={
          editingDay !== null
            ? (dayTimes[editingDay] ?? EMPTY_TIMES)
            : EMPTY_TIMES
        }
        onConfirm={handleDayTimesConfirm}
        onClose={() => setEditingDay(null)}
      />
    </View>
  );
};

export default WeeklyTimesTab;
