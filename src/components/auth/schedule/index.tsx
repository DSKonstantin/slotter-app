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
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { days } from "@/src/constants/days";
import { maskTime } from "@/src/utils/mask/maskTime";

type ScheduleFormValues = {
  workingTimeFrom: string;
  workingTimeTo: string;
  workingDays: string[];
};

const Schedule = () => {
  const [activeDays, setActiveDays] = useState<string[]>([]);
  const VerifySchema = Yup.object().shape({
    workingTimeFrom: Yup.string()
      .matches(/^\d{2}:\d{2}$/, "Введите время полностью")
      .required("Укажите время начала"),
    workingTimeTo: Yup.string()
      .matches(/^\d{2}:\d{2}$/, "Введите время полностью")
      .required("Укажите время окончания"),
    workingDays: Yup.array()
      .of(Yup.string())
      .min(1, "Выберите минимум один рабочий день")
      .required("Выберите рабочие дни"),
  });

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      workingTimeFrom: "",
      workingTimeTo: "",
      workingDays: [],
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
    router.push(Routers.auth.notification);
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
          <Typography weight="medium" className="text-body text-gray">
            Нажми на дни, когда ты принимаешь
          </Typography>

          <View className="flex-row mt-5 gap-2">
            {days.map((day) => (
              <Button
                key={day.id}
                title={day.label}
                variant={activeDays.includes(day.id) ? "primary" : "secondary"}
                onPress={() => toggleDay(day.id)}
                buttonProps={{
                  className: "flex-1",
                }}
                containerClassName="h-auto aspect-square rounded-[99px]"
              />
            ))}
          </View>
          <View className="min-h-[20px]">
            {methods.formState.errors.workingDays && (
              <Typography
                weight="medium"
                className="text-accent-red text-caption mt-[2px]"
              >
                {methods.formState.errors.workingDays.message as string}
              </Typography>
            )}
          </View>

          <Typography weight="medium" className="text-gray text-caption">
            Время работы
          </Typography>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <RhfTextField
                name="workingTimeFrom"
                placeholder="9:00"
                hideErrorText
                maskFn={maskTime}
                endAdornment={<StSvg name="Time" size={24} color="#8E8E93" />}
              />
            </View>

            <View className="w-5 items-center mt-[25px]">
              <Divider />
            </View>

            <View className="flex-1">
              <RhfTextField
                name="workingTimeTo"
                placeholder="18:00"
                hideErrorText
                maskFn={maskTime}
                endAdornment={<StSvg name="Time" size={24} color="#8E8E93" />}
              />
            </View>
          </View>

          <Typography weight="medium" className="text-caption text-gray">
            Свободный или сменный график (2/2) можно будет настроить в календаре
            позже
          </Typography>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Schedule;
