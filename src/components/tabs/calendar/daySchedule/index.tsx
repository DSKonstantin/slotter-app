import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { router } from "expo-router";
import React from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { unMask } from "react-native-mask-text";
import * as Yup from "yup";

import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import {
  Button,
  Divider,
  IconButton,
  Item,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { TAB_BAR_HEIGHT, TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { BreaksFieldArray } from "@/src/components/auth/schedule/breaksFieldArray";
import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { colors } from "@/src/styles/colors";
import SlotCard from "@/src/components/shared/cards/scheduling/slotCard";
import TimeSlotCard from "@/src/components/shared/cards/scheduling/timeSlotCard";

const mockAppointments = [
  {
    timeStart: "10:00",
    timeEnd: "11:00",
    clientName: "Анна Петрова",
    service: "Стрижка + укладка",
  },
  {
    timeStart: "11:00",
    timeEnd: "13:00",
    clientName: "Мария Иванова",
    service: "Окрашивание",
  },
  {
    timeStart: "15:00",
    timeEnd: "16:30",
    clientName: "Ольга Сидорова",
    service: "Укладка вечерняя",
  },
];

const VerifySchema = Yup.object().shape({
  atHome: Yup.boolean().required(),
  date: Yup.string().required(),
  scheduleStart: Yup.string().required(),
  scheduleEnd: Yup.string().required(),
  breaks: Yup.array().of(
    Yup.object().shape({
      start: Yup.string().required(),
      end: Yup.string().required(),
    }),
  ),
});

const CalendarDaySchedule = () => {
  const { top, bottom, left, right } = useSafeAreaInsets();
  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      atHome: false,
      date: format(new Date(), "d MMMM, EEEE", { locale: ru }),
      scheduleStart: "9:00",
      scheduleEnd: "18:00",
      breaks: [{ start: "12:00", end: "13:00" }],
    },
  });

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = (data: any) => {
    const { phone, atHome, date, scheduleStart, scheduleEnd, breaks } = data;
    console.log(
      "SUBMIT",
      `+${unMask(phone)}`,
      atHome,
      date,
      scheduleStart,
      scheduleEnd,
      breaks,
    );
    // router.push(Routers.auth.enterCode);
  };

  return (
    <>
      <ToolbarTop title="Настроить день" />

      <FormProvider {...methods}>
        <SafeAreaView className="flex-1" edges={["left", "right"]}>
          <ScrollView
            className="flex-1 px-screen"
            contentContainerStyle={{
              paddingTop: top + TOOLBAR_HEIGHT + 16,
              paddingBottom: TAB_BAR_HEIGHT + bottom + 82,
            }}
          >
            <Item title="Рабочий день" right={<RHFSwitch name="atHome" />} />
            <View
              pointerEvents={!watch("atHome") ? "none" : "auto"}
              className={`mt-5 ${!watch("atHome") ? "opacity-40" : "opacity-100"}`}
            >
              <RhfTextField name="date" label="Дата" disabled={true} />

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <RhfDatePicker
                    name="workingTimeFrom"
                    placeholder="9:00"
                    hideErrorText
                    endAdornment={
                      <StSvg
                        name="Time"
                        size={24}
                        color={colors.neutral[500]}
                      />
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
                      <StSvg
                        name="Time"
                        size={24}
                        color={colors.neutral[500]}
                      />
                    }
                  />
                </View>
              </View>
              <BreaksFieldArray />
              <Divider className="my-5" />
              <View className="gap-2.5">
                <Typography className="text-caption text-neutral-500">
                  Записи на этот день
                </Typography>
                {mockAppointments.map((appointment, index) => (
                  <TimeSlotCard
                    key={index}
                    time={appointment.timeStart}
                    name={appointment.clientName}
                    service={appointment.service}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
        <View
          className="absolute flex-1 w-full"
          style={{
            zIndex: 100,
            bottom: TAB_BAR_HEIGHT + bottom + 16,
            right: 0,
            paddingRight: right + 20,
            paddingLeft: left + 20,
          }}
        >
          <Button
            title="Сохранить изменения"
            rightIcon={
              <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
            }
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </FormProvider>
    </>
  );
};

export default CalendarDaySchedule;
