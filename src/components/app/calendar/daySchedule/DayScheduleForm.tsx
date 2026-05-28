import React from "react";
import { View } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { type DayScheduleFormValues } from "@/src/validation/schemas/daySchedule.schema";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { Item } from "@/src/components/ui";
import { WorkingHoursFields } from "@/src/components/shared/timeFields/WorkingHoursFields";
import {
  DEFAULT_BREAK_END,
  DEFAULT_BREAK_START,
  DEFAULT_END_AT,
  DEFAULT_START_AT,
} from "@/src/constants/hoursOptions";

export type { DayScheduleFormValues };

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

        <WorkingHoursFields
          label="Расписание"
          startName="startAt"
          endName="endAt"
          spacing="loose"
          startDefault={DEFAULT_START_AT}
          endDefault={DEFAULT_END_AT}
          breakStartDefault={DEFAULT_BREAK_START}
          breakEndDefault={DEFAULT_BREAK_END}
        />
      </View>
    </>
  );
};
