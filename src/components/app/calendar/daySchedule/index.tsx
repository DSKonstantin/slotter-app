import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";
import { skipToken } from "@reduxjs/toolkit/query";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetWorkingDayQuery,
  useUpdateWorkingDayMutation,
} from "@/src/store/redux/services/api/workingDaysApi";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

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

const CalendarDaySchedule = ({ workingDayId }: { workingDayId: number }) => {
  const auth = useRequiredAuth();

  const { data: workingDay } = useGetWorkingDayQuery(
    auth ? { userId: auth.userId, id: workingDayId } : skipToken,
  );

  const [updateWorkingDay, { isLoading }] = useUpdateWorkingDayMutation();
  const initialBreakIds = useRef<number[]>([]);

  const methods = useForm<DayScheduleFormValues>({
    resolver: yupResolver(DayScheduleSchema) as Resolver<DayScheduleFormValues>,
    defaultValues: {
      atHome: true,
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (!workingDay) return;
    const breaks = (workingDay.working_day_breaks ?? []).map((b) => ({
      id: b.id,
      start: formatTimeFromISO(b.start_at),
      end: formatTimeFromISO(b.end_at),
    }));
    initialBreakIds.current = breaks.map((b) => b.id);
    reset({
      atHome: true,
      date: format(new Date(workingDay.day), "d MMMM, EEEE", { locale: ru }),
      scheduleStart: formatTimeFromISO(workingDay.start_at),
      scheduleEnd: formatTimeFromISO(workingDay.end_at),
      breaks,
    });
  }, [workingDay, reset]);

  const onSubmit = async (data: DayScheduleFormValues) => {
    if (!auth) return;
    try {
      await updateWorkingDay({
        userId: auth.userId,
        id: workingDayId,
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
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Ошибка сохранения");
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

export default CalendarDaySchedule;
