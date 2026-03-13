import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import React, { useRef } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import {
  FormProvider,
  Resolver,
  useForm,
  useFormContext,
} from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";
import { skipToken } from "@reduxjs/toolkit/query";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetWorkingDayQuery,
  useUpdateWorkingDayMutation,
} from "@/src/store/redux/services/api/workingDaysApi";
import type { WorkingDay } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { formatTimeFromISO } from "@/src/utils/date/formatTime";
import { formatFullDateWithDay } from "@/src/utils/date/formatDate";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, Divider, StSvg, Typography } from "@/src/components/ui";
import {
  DayScheduleForm,
  DayScheduleSchema,
  DayScheduleFormValues,
} from "./DayScheduleForm";
import DayScheduleAppointments from "@/src/components/app/calendar/daySchedule/DayScheduleAppointments";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { colors } from "@/src/styles/colors";

type DayScheduleEditProps = {
  workingDay: WorkingDay;
  userId: number;
};

const DayScheduleEdit = ({ workingDay, userId }: DayScheduleEditProps) => {
  const { left, right } = useSafeAreaInsets();
  const [updateWorkingDay, { isLoading }] = useUpdateWorkingDayMutation();

  const breaks = (workingDay.working_day_breaks ?? []).map((b) => ({
    id: b.id,
    start: formatTimeFromISO(b.start_at),
    end: formatTimeFromISO(b.end_at),
  }));

  const initialBreakIds = useRef<number[]>(breaks.map((b) => b.id));

  const methods = useForm<DayScheduleFormValues>({
    resolver: yupResolver(DayScheduleSchema) as Resolver<DayScheduleFormValues>,
    defaultValues: {
      atHome: true,
      date: formatFullDateWithDay(new Date(workingDay.day)),
      scheduleStart: formatTimeFromISO(workingDay.start_at),
      scheduleEnd: formatTimeFromISO(workingDay.end_at),
      breaks,
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: DayScheduleFormValues) => {
    try {
      await updateWorkingDay({
        userId,
        id: workingDay.id,
        data: {
          start_at: data.scheduleStart,
          end_at: data.scheduleEnd,
          working_day_breaks_attributes: [
            ...(data.breaks ?? []).map((b) => ({
              id: b.id,
              start_at: b.start,
              end_at: b.end,
            })),
            ...initialBreakIds.current
              .filter((id) => !data.breaks?.some((b) => b.id === id))
              .map((id) => ({ id, _destroy: true as const })),
          ],
        },
      }).unwrap();
      router.back();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Ошибка сохранения"));
    }
  };

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Настроить день">
        {({ topInset, bottomInset }) => (
          <>
            <SafeAreaView className="flex-1" edges={["left", "right"]}>
              <ScrollView
                className="flex-1 px-screen"
                contentContainerStyle={{
                  paddingTop: topInset + 16,
                  paddingBottom: bottomInset + 82,
                }}
              >
                <DayScheduleForm />
                <Divider className="my-5" />
                <DayScheduleAppointments date={"date"} />
              </ScrollView>
            </SafeAreaView>
            <View
              className="absolute flex-1 w-full"
              style={{
                zIndex: 100,
                bottom: bottomInset + 16,
                right: 0,
                paddingRight: left + 20,
                paddingLeft: right + 20,
              }}
            >
              <Button
                title="Сохранить изменения"
                loading={isLoading}
                disabled={isLoading}
                rightIcon={
                  <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
                }
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

const CalendarDaySchedule = ({ workingDayId }: { workingDayId: number }) => {
  const auth = useRequiredAuth();

  const {
    data: workingDay,
    isLoading,
    isError,
  } = useGetWorkingDayQuery(
    auth ? { userId: auth.userId, id: workingDayId } : skipToken,
  );

  if (!auth) return null;

  if (isLoading) {
    return (
      <ScreenWithToolbar title="Настроить день">
        {() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  if (isError || !workingDay) {
    return (
      <ScreenWithToolbar title="Настроить день">
        {() => (
          <View className="flex-1 items-center justify-center px-screen">
            <Typography className="text-body text-neutral-400 text-center">
              Не удалось загрузить данные дня
            </Typography>
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  return <DayScheduleEdit workingDay={workingDay} userId={auth.userId} />;
};

export default CalendarDaySchedule;
