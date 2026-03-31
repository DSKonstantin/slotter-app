import React, { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { addMonths, format, parseISO, subMonths } from "date-fns";
import { ru } from "date-fns/locale";
import { FormProvider } from "react-hook-form";

import { IconButton, StSvg, Typography } from "@/src/components/ui";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import ScheduleDayCard from "@/src/components/shared/cards/scheduleDayCard";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { getScheduleTimeLabel } from "@/src/utils/calendar/scheduleHelpers";
import { useCalendarSchedule } from "@/src/hooks/useCalendarSchedule";
import {
  scheduleCalendarTheme,
  calendarStyle,
} from "@/src/styles/calendarTheme";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { ScheduleSettingsModal } from "./ScheduleSettingsModal";
import { ScheduleTemplateModal } from "./ScheduleTemplateModal";

const CalendarSchedule = () => {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [current, setCurrent] = useState(date ? parseISO(date) : new Date());

  const {
    methods,
    handleSubmit,
    calendarDays,
    appointmentDates,
    modalVisible,
    modalTemplate,
    setModalTemplate,
    isSaving,
    hasPendingEditableSelection,
    clearSelection,
    toggleDay,
    handleSave,
    applyTemplateDays,
  } = useCalendarSchedule(current);

  useFocusEffect(
    useCallback(() => {
      return () => clearSelection();
    }, [clearSelection]),
  );

  const calendarDaysMap = useMemo(
    () => Object.fromEntries(calendarDays.map((day) => [day.date, day])),
    [calendarDays],
  );

  const renderHeader = useCallback(
    () => (
      <View className="flex-1 flex-row items-center justify-center mb-5">
        <View className="items-center flex-row gap-4 bg-background-surface h-[48px] rounded-full px-5">
          <IconButton
            size="xs"
            icon={
              <StSvg name="Expand_left" size={24} color={colors.neutral[500]} />
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
    ),
    [current],
  );

  const renderDay = useCallback(
    ({ date, state }: any) => {
      const isToday = state === "today";
      const dayData = date ? calendarDaysMap[date.dateString] : undefined;

      const handlePress = () => {
        if (!date || !dayData) return;

        if (dayData.isExisting && dayData.workingDayId) {
          if (hasPendingEditableSelection) {
            Alert.alert(
              "Несохранённые изменения",
              "У вас есть несохранённые дни. Если перейти к редактированию, выбор сбросится.",
              [
                { text: "Отмена", style: "cancel" },
                {
                  text: "Перейти",
                  style: "destructive",
                  onPress: () => {
                    clearSelection();
                    router.push(
                      Routers.app.calendar.daySchedule(dayData.workingDayId!),
                    );
                  },
                },
              ],
            );
            return;
          }
          router.push(Routers.app.calendar.daySchedule(dayData.workingDayId));
          return;
        }

        toggleDay(dayData.date);
      };

      return (
        <View className="w-full h-[70px]">
          <ScheduleDayCard
            day={date?.day}
            isWorking={dayData?.isExisting}
            scheduleTime={
              dayData?.isExisting ? getScheduleTimeLabel(dayData) : undefined
            }
            hasAppointments={appointmentDates.has(date?.dateString ?? "")}
            isSelected={dayData?.isSelected}
            isToday={isToday}
            onPress={handlePress}
          />
        </View>
      );
    },
    [
      calendarDaysMap,
      appointmentDates,
      hasPendingEditableSelection,
      clearSelection,
      toggleDay,
    ],
  );

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar
        title="График"
        rightButton={
          <IconButton
            icon={
              <StSvg
                name="Load_list_alt"
                size={28}
                color={colors.neutral[900]}
              />
            }
            onPress={() => setModalTemplate(true)}
          />
        }
      >
        {({ topInset }) => (
          <SafeAreaView
            edges={["left", "right"]}
            className="flex-1 px-screen"
            style={{ paddingTop: topInset }}
          >
            <Calendar
              key={format(current, "yyyy-MM")}
              initialDate={formatApiDate(current)}
              firstDay={1}
              hideArrows
              // hideDayNames
              hideExtraDays={true}
              renderHeader={renderHeader}
              theme={scheduleCalendarTheme}
              style={calendarStyle.calendar}
              dayComponent={renderDay}
            />
          </SafeAreaView>
        )}
      </ScreenWithToolbar>

      <ScheduleSettingsModal
        visible={modalVisible}
        onClose={clearSelection}
        onSave={handleSubmit(handleSave)}
        isLoading={isSaving}
      />

      <ScheduleTemplateModal
        visible={modalTemplate}
        onClose={() => setModalTemplate(false)}
        onApply={(template) => applyTemplateDays(template.days)}
      />
    </FormProvider>
  );
};

export default CalendarSchedule;
