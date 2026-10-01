import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useController } from "react-hook-form";
import { Divider, StSvg, Tag, Typography } from "@/src/components/ui";
import { days as WEEK_DAYS } from "@/src/constants/days";
import { formatMinutes } from "@/src/utils/date/formatTime";
import { colors } from "@/src/styles/colors";
import type { BookingFixedTimeFormValues, DayId } from "./constants";
import {
  buildGridItems,
  EMPTY_TIMES,
  getDayRange,
  getDaySource,
  toggleItem,
  type WorkingRanges,
} from "./utils";
import ChipGrid from "./ChipGrid";
import ScheduleHint from "./ScheduleHint";
import DayTimesModal from "./DayTimesModal";

const DAY_ITEMS = WEEK_DAYS.map((day) => ({ value: day.id, label: day.label }));

type WeeklyTimesTabProps = {
  interval: number;
  ranges: WorkingRanges;
};

const WeeklyTimesTab = ({ interval, ranges }: WeeklyTimesTabProps) => {
  const [editingDay, setEditingDay] = useState<DayId | null>(null);

  const { field: daysField } = useController<
    BookingFixedTimeFormValues,
    "days"
  >({ name: "days" });
  const { field: dayTimesField } = useController<
    BookingFixedTimeFormValues,
    "dayTimes"
  >({ name: "dayTimes" });

  const visibleDays = useMemo(
    () => WEEK_DAYS.filter((day) => daysField.value.includes(day.id)),
    [daysField.value],
  );
  const timesByDay = useMemo(
    () =>
      Object.fromEntries(
        WEEK_DAYS.map((day) => [
          day.id,
          dayTimesField.value[day.id] ?? EMPTY_TIMES,
        ]),
      ) as Record<DayId, number[]>,
    [dayTimesField.value],
  );
  const editingItems = useMemo(
    () =>
      editingDay === null
        ? []
        : buildGridItems(
            interval,
            getDayRange(ranges, editingDay),
            timesByDay[editingDay],
          ),
    [editingDay, interval, ranges, timesByDay],
  );
  const editingHint = useMemo(() => {
    if (editingDay === null) return undefined;
    const range = getDayRange(ranges, editingDay);
    const hours = `${formatMinutes(range.start)}–${formatMinutes(range.end)}`;
    return getDaySource(ranges, editingDay) === "template"
      ? `По шаблону недели: ${hours}`
      : `В шаблоне недели для этого дня нет часов, общий диапазон: ${hours}`;
  }, [editingDay, ranges]);
  const editingDayLabel = useMemo(
    () => WEEK_DAYS.find((day) => day.id === editingDay)?.fullLabel ?? "",
    [editingDay],
  );

  const handleDayToggle = (day: DayId) => {
    const next = toggleItem(daysField.value, day);
    daysField.onChange(
      WEEK_DAYS.map((d) => d.id).filter((id) => next.includes(id)),
    );
  };

  const handleDayTimesConfirm = (times: number[]) => {
    if (editingDay === null) return;
    dayTimesField.onChange({ ...dayTimesField.value, [editingDay]: times });
    setEditingDay(null);
  };

  return (
    <View className="gap-3">
      <Typography weight="regular" className="text-caption text-neutral-500">
        Выберите дни, в которые будет доступна онлайн-запись
      </Typography>
      <ChipGrid
        items={DAY_ITEMS}
        selected={daysField.value}
        columns={5}
        chipClassName="rounded-small"
        onToggle={handleDayToggle}
      />

      <ScheduleHint range={ranges.all} />

      {visibleDays.length > 0 && (
        <View className="bg-background-surface rounded-base">
          {visibleDays.map((day, index) => {
            const times = timesByDay[day.id];
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
                        <Tag
                          key={time}
                          title={formatMinutes(time)}
                          size="sm"
                          containerClassName="rounded-full"
                        />
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
        items={editingItems}
        hint={editingHint}
        value={editingDay !== null ? timesByDay[editingDay] : EMPTY_TIMES}
        onConfirm={handleDayTimesConfirm}
        onClose={() => setEditingDay(null)}
      />
    </View>
  );
};

export default WeeklyTimesTab;
