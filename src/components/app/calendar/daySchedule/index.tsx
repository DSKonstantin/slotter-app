import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { router } from "expo-router";
import React, { useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";
import { skipToken } from "@reduxjs/toolkit/query";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetWorkingDayQuery,
  useUpdateWorkingDayMutation,
} from "@/src/store/redux/services/api/workingDaysApi";
import type { WorkingDay } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Typography } from "@/src/components/ui";
import {
  DayScheduleForm,
  DayScheduleSchema,
  DayScheduleFormValues,
} from "./DayScheduleForm";

const formatTimeFromISO = (iso: string) => {
  if (!iso) return "";
  const isoMatch = iso.match(/T(\d{2}):(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}:${isoMatch[2]}`;
  const timeMatch = iso.match(/^(\d{1,2}):(\d{2})/);
  if (timeMatch) return `${timeMatch[1]}:${timeMatch[2]}`;
  return "";
};

type DayScheduleEditProps = {
  workingDay: WorkingDay;
  userId: number;
};

const DayScheduleEdit = ({ workingDay, userId }: DayScheduleEditProps) => {
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
      date: format(new Date(workingDay.day), "d MMMM, EEEE", { locale: ru }),
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
          <DayScheduleForm
            topInset={topInset}
            bottomInset={bottomInset}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
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
