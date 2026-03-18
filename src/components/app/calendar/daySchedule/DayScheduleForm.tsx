import React from "react";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFormContext, useWatch } from "react-hook-form";
import * as Yup from "yup";

import { formatTime, parseTimeString } from "@/src/utils/date/formatTime";

import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { Divider, Item, StSvg, Typography } from "@/src/components/ui";
import { DayScheduleBreaksFieldArray } from "./DayScheduleBreaksFieldArray";
import { colors } from "@/src/styles/colors";

export const DayScheduleSchema = Yup.object().shape({
  isActive: Yup.boolean().required(),
  date: Yup.string().required(),
  scheduleStart: Yup.string().required(),
  scheduleEnd: Yup.string().required(),
  breaks: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().optional(),
      start: Yup.string().required(),
      end: Yup.string().required(),
    }),
  ),
});

export type DayScheduleFormValues = Yup.InferType<typeof DayScheduleSchema>;

export const DayScheduleForm = () => {
  const { control } = useFormContext<DayScheduleFormValues>();
  const isActive = useWatch({ control, name: "isActive" });

  return (
    <>
      <Item title="Рабочий день" right={<RHFSwitch name="isActive" />} />
      <View
        pointerEvents={!isActive ? "none" : "auto"}
        className={`mt-5 ${!isActive ? "opacity-40" : "opacity-100"}`}
      >
        <RhfTextField name="date" label="Дата" disabled={true} />

        <Typography className="mb-2 text-neutral-500 text-caption">
          Расписание
        </Typography>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <RhfDatePicker
              name="scheduleStart"
              placeholder="9:00"
              hideErrorText
              parseValue={parseTimeString}
              formatValue={formatTime}
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
              name="scheduleEnd"
              placeholder="18:00"
              hideErrorText
              parseValue={parseTimeString}
              formatValue={formatTime}
              endAdornment={
                <StSvg name="Time" size={24} color={colors.neutral[500]} />
              }
            />
          </View>
        </View>
        <DayScheduleBreaksFieldArray />
      </View>
    </>
  );
};
