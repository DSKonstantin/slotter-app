import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { router } from "expo-router";
import React from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { Routers } from "@/src/constants/routers";
import { useCreateWorkingDayMutation } from "@/src/store/redux/services/api/workingDaysApi";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

import {
  DayScheduleForm,
  DayScheduleSchema,
  DayScheduleFormValues,
} from "./DayScheduleForm";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { ScrollView, View } from "react-native";
import { Button, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const CalendarDayScheduleCreate = ({ date }: { date: string }) => {
  const { left, right } = useSafeAreaInsets();
  const auth = useRequiredAuth();
  const [createWorkingDay, { isLoading }] = useCreateWorkingDayMutation();

  const methods = useForm<DayScheduleFormValues>({
    resolver: yupResolver(DayScheduleSchema) as Resolver<DayScheduleFormValues>,
    defaultValues: {
      isActive: true,
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
          is_active: data.isActive,
          ...(data.breaks &&
            data.breaks.length > 0 && {
              working_day_breaks_attributes: data.breaks.map((b) => ({
                start_at: b.start,
                end_at: b.end,
              })),
            }),
        },
      }).unwrap();
      router.replace(Routers.app.calendar.root(date, "day"));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось создать рабочий день"));
    }
  };

  if (!auth) return null;

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать день">
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

export default CalendarDayScheduleCreate;
