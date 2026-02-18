import React, { useState } from "react";
import * as Yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { View } from "react-native";
import { StepProgress } from "@/src/components/ui/StepProgress";
import { Button, Divider, StSvg, Typography } from "@/src/components/ui";
import { days } from "@/src/constants/days";
import { colors } from "@/src/styles/colors";
import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { BreaksFieldArray } from "@/src/components/onboarding/schedule/breaksFieldArray";

type ScheduleFormValues = {
  workingTimeFrom: string;
  workingTimeTo: string;
  workingDays: (string | undefined)[];
};

const Schedule = () => {
  const [activeDays, setActiveDays] = useState<string[]>([]);
  const VerifySchema = Yup.object().shape({
    workingTimeFrom: Yup.string()
      // .matches(/^\d{2}:\d{2}$/, "Введите время полностью")
      .required("Укажите время начала"),
    workingTimeTo: Yup.string()
      // .matches(/^\d{2}:\d{2}$/, "Введите время полностью")
      .required("Укажите время окончания"),
    workingDays: Yup.array()
      .of(Yup.string())
      .min(1, "Выберите минимум один рабочий день")
      .required("Выберите рабочие дни"),
    breaks: Yup.array(),
  });

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      workingTimeFrom: "",
      workingTimeTo: "",
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

  const onSubmit = (data: ScheduleFormValues) => {
    console.log("SUBMIT", data);
    router.push(Routers.onboarding.notification);
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
              onPress: methods.handleSubmit(onSubmit),
            }}
            secondary={{
              title: "Пропустить",
              variant: "clear",
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

          <Typography className="text-neutral-500 text-caption">
            Время работы
          </Typography>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <RhfDatePicker
                name="workingTimeFrom"
                placeholder="9:00"
                hideErrorText
                endAdornment={
                  <StSvg name="Time" size={24} color={colors.neutral[500]} />
                }
              />
            </View>

            <View className="w-5 items-center mt-[25px]">
              <Divider />
            </View>

            <View className="flex-1">
              <RhfDatePicker
                name="workingTimeTo"
                placeholder="18:00"
                hideErrorText
                endAdornment={
                  <StSvg name="Time" size={24} color={colors.neutral[500]} />
                }
              />
            </View>
          </View>

          <Typography className="text-caption text-neutral-900">
            Свободный или сменный график (2/2) можно будет настроить в календаре
            позже
          </Typography>

          <BreaksFieldArray />
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Schedule;
