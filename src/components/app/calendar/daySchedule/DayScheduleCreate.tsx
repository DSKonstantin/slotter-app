import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { router } from "expo-router";
import React from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useCreateWorkingDayMutation } from "@/src/store/redux/services/api/workingDaysApi";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

import {
  DayScheduleForm,
  DayScheduleSchema,
  DayScheduleFormValues,
} from "./DayScheduleForm";

const CalendarDayScheduleCreate = ({ date }: { date: string }) => {
  const auth = useRequiredAuth();
  const [createWorkingDay, { isLoading }] = useCreateWorkingDayMutation();

  const methods = useForm<DayScheduleFormValues>({
    resolver: yupResolver(DayScheduleSchema) as Resolver<DayScheduleFormValues>,
    defaultValues: {
      atHome: true,
      date: format(new Date(date), "d MMMM, EEEE", { locale: ru }),
      scheduleStart: "",
      scheduleEnd: "",
      breaks: [],
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: DayScheduleFormValues) => {
    if (!auth) return;
    try {
      await createWorkingDay({
        userId: auth.userId,
        data: {
          day: date,
          start_at: data.scheduleStart,
          end_at: data.scheduleEnd,
          ...(data.breaks &&
            data.breaks.length > 0 && {
              working_day_breaks_attributes: data.breaks.map((b) => ({
                start_at: b.start,
                end_at: b.end,
              })),
            }),
        },
      }).unwrap();
      router.back();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Ошибка сохранения");
    }
  };

  if (!auth) return null;

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать день">
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

export default CalendarDayScheduleCreate;
