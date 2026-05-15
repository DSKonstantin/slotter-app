import React, { useState, useCallback, useMemo } from "react";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { addMonths, format, parseISO, subMonths } from "date-fns";
import { ru } from "date-fns/locale";
import { FormProvider } from "react-hook-form";

import { IconButton, StSvg, Typography } from "@/src/components/ui";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import ScheduleDayCard from "@/src/components/shared/cards/scheduleDayCard";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { getScheduleTimeLabel } from "@/src/utils/calendar/scheduleHelpers";
import { useCalendarSchedule } from "@/src/hooks/useCalendarSchedule";
import { useRefresh } from "@/src/hooks/useRefresh";
import {
  scheduleCalendarTheme,
  calendarStyle,
} from "@/src/styles/calendarTheme";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { ScheduleSettingsModal } from "./ScheduleSettingsModal";
import { ScheduleTemplateModal } from "./ScheduleTemplateModal";
import ScheduleSkeleton from "./ScheduleSkeleton";

const CalendarSchedule = ({ showBack = true }: { showBack?: boolean }) => {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [current, setCurrent] = useState(() => {
    if (!date) return new Date();
    const parsed = parseISO(date);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  });

  const {
    methods,
    calendarDays,
    appointmentDates,
    modalVisible,
    modalTemplate,
    setModalTemplate,
    isSaving,
    isLoading,
    isError,
    refetch,
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

  const { refreshing, onRefresh } = useRefresh(refetch);

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
          if (dayData.isSelected) {
            toggleDay(dayData.date);
            return;
          }

          const navigate = () =>
            router.push(
              Routers.app.calendar.daySchedule(dayData.workingDayId!),
            );

          if (methods.formState.isDirty) {
            Alert.alert(
              "Перейти к дню?",
              "Несохранённые изменения будут сброшены.",
              [
                { text: "Отмена", style: "cancel" },
                { text: "Перейти", style: "destructive", onPress: navigate },
              ],
            );
            return;
          }

          navigate();
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
    [calendarDaysMap, appointmentDates, toggleDay, methods.formState.isDirty],
  );

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar
        title="График"
        showBack={showBack}
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
        {({ topInset, bottomInset }) => (
          <SafeAreaView edges={["left", "right"]} className="flex-1 px-screen">
            {isLoading ? (
              <View style={{ paddingTop: topInset, flex: 1 }}>
                <ScheduleSkeleton />
              </View>
            ) : isError ? (
              <ErrorScreen
                title="Не удалось загрузить расписание"
                onRetry={refetch}
              />
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingTop: topInset,
                  paddingBottom: bottomInset + 8,
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              >
                <Calendar
                  key={format(current, "yyyy-MM")}
                  initialDate={formatApiDate(current)}
                  firstDay={1}
                  hideArrows
                  hideExtraDays={true}
                  renderHeader={renderHeader}
                  theme={scheduleCalendarTheme}
                  style={calendarStyle.calendar}
                  dayComponent={renderDay}
                />
              </ScrollView>
            )}
          </SafeAreaView>
        )}
      </ScreenWithToolbar>

      <ScheduleSettingsModal
        visible={modalVisible}
        onClose={clearSelection}
        onSave={handleSave}
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
