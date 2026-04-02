import React from "react";
import { View } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { type DayScheduleFormValues } from "@/src/validation/schemas/daySchedule.schema";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { Item } from "@/src/components/ui";
import { BreaksFieldArray } from "@/src/components/shared/timeFields/BreaksFieldArray";
import { TimeFields } from "@/src/components/shared/timeFields/TimeFields";

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

        <View className="mb-5">
          <TimeFields
            label="Расписание"
            startName="scheduleStart"
            endName="scheduleEnd"
          />
        </View>
        <BreaksFieldArray />
      </View>
    </>
  );
};
