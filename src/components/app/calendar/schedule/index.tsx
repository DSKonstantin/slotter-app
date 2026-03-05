import React, { useMemo, useState, useCallback } from "react";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import ScheduleDayCard from "@/src/components/shared/cards/scheduleDayCard";
import { View } from "react-native";
import {
  format,
  startOfMonth,
  endOfMonth,
  addDays,
  getDate,
  getYear,
  getMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { FlashList } from "@shopify/flash-list";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetWorkingDaysQuery,
  useBulkCreateWorkingDaysMutation,
} from "@/src/store/redux/services/api/workingDaysApi";
import { ScheduleSettingsModal } from "./ScheduleSettingsModal";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  CalendarScheduleSchema,
  type CalendarScheduleFormValues,
} from "@/src/validation/schemas/calendarSchedule.schema";

type DayItem = {
  date: Date;
  hasSchedule: boolean;
  workingDayId?: number;
  scheduleTime?: string;
};

type WorkingDayMeta = { id: number; startAt: string; endAt: string };

const generateMonth = (
  year: number,
  month: number,
  workingDayKeys: Record<string, WorkingDayMeta>,
): DayItem[] => {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);
  const days: DayItem[] = [];

  for (let i = 0; i < getDate(end); i++) {
    const date = addDays(start, i);
    const key = date.toISOString().split("T")[0];
    const meta = workingDayKeys[key];
    days.push({
      date,
      hasSchedule: !!meta,
      workingDayId: meta?.id,
      scheduleTime: meta ? `${meta.startAt} - ${meta.endAt}` : undefined,
    });
  }

  return days;
};

const CalendarSchedule = () => {
  const [current, setCurrent] = useState(new Date());
  const [modalHeight, setModalHeight] = useState(0);
  const { bottom } = useSafeAreaInsets();
  const auth = useRequiredAuth();
  const [bulkCreateWorkingDays, { isLoading: isSaving }] =
    useBulkCreateWorkingDaysMutation();

  const methods = useForm<CalendarScheduleFormValues>({
    resolver: yupResolver(CalendarScheduleSchema) as any,
    defaultValues: {
      selectedDays: [],
      scheduleStart: "",
      scheduleEnd: "",
      breaks: [],
    },
  });

  const { setValue, getValues, handleSubmit, watch } = methods;

  const watchedSelectedDays = watch("selectedDays");
  const selectedDays = useMemo(
    () => watchedSelectedDays ?? [],
    [watchedSelectedDays],
  );
  const modalVisible = selectedDays.length > 0;

  const { data: workingDaysData } = useGetWorkingDaysQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const workingDayKeys = useMemo(() => {
    const map: Record<string, WorkingDayMeta> = {};
    for (const wd of workingDaysData?.working_days ?? []) {
      map[wd.day] = { id: wd.id, startAt: wd.start_at, endAt: wd.end_at };
    }
    return map;
  }, [workingDaysData]);

  const days = useMemo(
    () => generateMonth(getYear(current), getMonth(current), workingDayKeys),
    [current, workingDayKeys],
  );

  const toggleDay = useCallback(
    (dateKey: string) => {
      const current = getValues("selectedDays") ?? [];
      const next = current.includes(dateKey)
        ? current.filter((d) => d !== dateKey)
        : [...current, dateKey];
      setValue("selectedDays", next, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  const handleSave = useCallback(
    async (values: CalendarScheduleFormValues) => {
      if (!auth) return;

      const workingDays = values.selectedDays.map((day) => ({
        day,
        start_at: values.scheduleStart,
        end_at: values.scheduleEnd,
        ...(values.breaks.length > 0 && {
          working_day_breaks: values.breaks.map((b) => ({
            start_at: b.start,
            end_at: b.end,
          })),
        }),
      }));

      try {
        await bulkCreateWorkingDays({
          userId: auth.userId,
          working_days: workingDays,
        }).unwrap();
        setValue("selectedDays", []);
      } catch (error: any) {
        toast.error(error?.data?.error || "Не удалось сохранить расписание");
      }
    },
    [auth, bulkCreateWorkingDays, setValue],
  );

  const renderItem = useCallback(
    ({ item }: { item: DayItem }) => {
      const dateKey = item.date.toISOString().split("T")[0];
      const isSelected = selectedDays.includes(dateKey);

      return (
        <View className="m-1 flex-1">
          <ScheduleDayCard
            date={item.date}
            hasSchedule={item.hasSchedule}
            scheduleTime={item.scheduleTime}
            showCheckbox={!item.hasSchedule}
            isSelected={isSelected}
            onPress={() => {
              if (!item.hasSchedule) {
                toggleDay(dateKey);
              }
            }}
          />
        </View>
      );
    },
    [selectedDays, toggleDay],
  );

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar
        title="График"
        rightButton={
          <IconButton
            icon={<StSvg name="Time" size={28} color={colors.neutral[900]} />}
            onPress={() => {}}
          />
        }
      >
        {({ topInset, bottomInset }) => (
          <SafeAreaView
            edges={["left", "right"]}
            className="flex-1"
            style={{ paddingTop: topInset }}
          >
            <View className="items-center mb-4 px-screen">
              <View className="flex-row items-center bg-background-surface rounded-full px-4 py-2 gap-4">
                <IconButton
                  size="xs"
                  icon={
                    <StSvg
                      name="Expand_left"
                      size={24}
                      color={colors.neutral[500]}
                    />
                  }
                  onPress={() => setCurrent((prev) => subMonths(prev, 1))}
                />

                <Typography
                  weight="semibold"
                  className="text-body capitalize w-[125px] text-center"
                >
                  {format(current, "LLLL yyyy", { locale: ru })}
                </Typography>

                <IconButton
                  size="xs"
                  icon={
                    <StSvg
                      name="Expand_right"
                      size={24}
                      color={colors.neutral[500]}
                    />
                  }
                  onPress={() => setCurrent((prev) => addMonths(prev, 1))}
                />
              </View>
            </View>

            <FlashList
              data={days}
              numColumns={3}
              keyExtractor={(item) => item.date.toISOString()}
              renderItem={renderItem}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom:
                  bottomInset + 16 + (modalVisible ? modalHeight : 0),
              }}
            />
          </SafeAreaView>
        )}
      </ScreenWithToolbar>
      <ScheduleSettingsModal
        visible={modalVisible}
        onClose={() => setValue("selectedDays", [])}
        onSave={handleSubmit(handleSave)}
        isLoading={isSaving}
        onHeightChange={(h) => setModalHeight(h - (TAB_BAR_HEIGHT + bottom))}
      />
    </FormProvider>
  );
};

export default CalendarSchedule;
