import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  OnboardingScheduleSchema,
  type OnboardingScheduleFormValues,
} from "@/src/validation/schemas/onboardingSchedule.schema";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { View } from "react-native";
import { StepProgress } from "@/src/components/ui/StepProgress";
import { Button, Typography } from "@/src/components/ui";
import { days, DAY_ID_BY_INDEX } from "@/src/constants/days";
import { WorkingHoursFields } from "@/src/components/shared/timeFields/WorkingHoursFields";
import { useBulkCreateWorkingDaysMutation } from "@/src/store/redux/services/api/workingDaysApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { format } from "date-fns";
import { getDatesUntilEndOfWeek } from "@/src/utils/schedule/getDatesUntilEndOfWeek";

const Schedule = () => {
  const auth = useRequiredAuth();
  const [activeDays, setActiveDays] = useState<string[]>([]);
  const [bulkCreateWorkingDays, { isLoading }] =
    useBulkCreateWorkingDaysMutation();

  const methods = useForm({
    resolver: yupResolver(OnboardingScheduleSchema),
    defaultValues: {
      startAt: "",
      endAt: "",
      workingDays: [],
      breaks: [],
    },
  });

  const toggleDay = (id: string) => {
    setActiveDays((prev) => {
      const next = prev.includes(id)
        ? prev.filter((day) => day !== id)
        : [...prev, id];

      methods.setValue("workingDays", next);

      if (next.length > 0) {
        methods.clearErrors("workingDays");
      }

      return next;
    });
  };

  const onSubmit = async (data: OnboardingScheduleFormValues) => {
    if (!auth) return;

    const working_days = getDatesUntilEndOfWeek()
      .filter((d) =>
        (data.workingDays as string[]).includes(DAY_ID_BY_INDEX[d.getDay()]),
      )
      .map((d) => ({
        day: format(d, "yyyy-MM-dd"),
        start_at: data.startAt,
        end_at: data.endAt,
        ...(data.breaks?.length && {
          working_day_breaks: data.breaks.map((b) => ({
            start_at: b.start!,
            end_at: b.end!,
          })),
        }),
      }));

    if (!working_days.length) {
      router.push(Routers.onboarding.notification);
      return;
    }

    try {
      await bulkCreateWorkingDays({
        userId: auth.userId,
        working_days,
      }).unwrap();

      router.push(Routers.onboarding.notification);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось сохранить расписание"));
    }
  };

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        footer={
          <AuthFooter
            primary={{
              title: "Завершить",
              variant: "accent",
              loading: isLoading,
              disabled: isLoading,
              onPress: methods.handleSubmit(onSubmit),
            }}
            secondary={{
              title: "Пропустить",
              variant: "clear",
              disabled: isLoading,
              onPress: () => {
                router.push(Routers.onboarding.notification);
              },
            }}
          />
        }
      >
        <View className="mt-4">
          <StepProgress steps={3} currentStep={3} />
        </View>
        <View className="mt-8 gap-2">
          <Typography weight="semibold" className="text-display mb-2">
            Дни работы
          </Typography>
          <Typography className="text-body text-neutral-500">
            Нажми на дни, когда ты принимаешь
          </Typography>

          <View className="flex-row mt-5 gap-2">
            {days.map((day) => (
              <Button
                key={day.id}
                title={day.label}
                variant={activeDays.includes(day.id) ? "primary" : "secondary"}
                onPress={() => toggleDay(day.id)}
                buttonClassName="flex-1 h-auto aspect-square rounded-[99px] p-0"
              />
            ))}
          </View>
          <View className="min-h-[20px]">
            {methods.formState.errors.workingDays && (
              <Typography className="text-accent-red-500 text-caption mt-[2px]">
                {methods.formState.errors.workingDays.message as string}
              </Typography>
            )}
          </View>

          <WorkingHoursFields
            label="Время работы"
            startName="startAt"
            endName="endAt"
            middleSlot={
              <Typography className="text-caption text-neutral-900">
                Свободный или сменный график (2/2) можно будет настроить в
                календаре позже
              </Typography>
            }
          />
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Schedule;
