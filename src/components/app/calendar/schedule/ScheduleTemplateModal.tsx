import React, { useCallback, useEffect } from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  Button,
  Divider,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";
import { formatTime } from "@/src/utils/date/formatTime";
import {
  ScheduleTemplateSchema,
  type ScheduleTemplateFormValues,
} from "@/src/validation/schemas/scheduleTemplate.schema";
import { days } from "@/src/constants/days";
import { DayScheduleBreaksFieldArray } from "@/src/components/app/calendar/daySchedule/DayScheduleBreaksFieldArray";
import { useScheduleTemplate } from "@/src/hooks/useScheduleTemplate";

const parseTimeString = (value: string): Date | null => {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const DayRow = ({ index }: { index: number }) => {
  const { control } = useFormContext<ScheduleTemplateFormValues>();

  const isEnabled = useWatch({
    control,
    name: `days.${index}.isEnabled`,
  });

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Typography weight="semibold" className="text-body">
          {days[index].fullLabel}
        </Typography>
        <RHFSwitch name={`days.${index}.isEnabled`} />
      </View>

      {isEnabled && (
        <View className="gap-3">
          <View className="flex-row gap-2">
            <View className="flex-1">
              <RhfDatePicker
                name={`days.${index}.startAt`}
                placeholder="9:00"
                hideErrorText
                parseValue={parseTimeString}
                formatValue={formatTime}
                endAdornment={
                  <StSvg name="Time" size={24} color={colors.neutral[500]} />
                }
              />
            </View>
            <View className="flex-1">
              <RhfDatePicker
                name={`days.${index}.endAt`}
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

          <DayScheduleBreaksFieldArray name={`days.${index}.breaks`} />
        </View>
      )}
    </View>
  );
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const ScheduleTemplateModal = ({ visible, onClose }: Props) => {
  const { height } = useWindowDimensions();
  const { initialValues, save } = useScheduleTemplate();

  const methods = useForm<ScheduleTemplateFormValues>({
    resolver: yupResolver(ScheduleTemplateSchema) as any,
    defaultValues: initialValues,
  });

  useEffect(() => {
    methods.reset(initialValues);
  }, [initialValues, methods]);

  const handleSave = useCallback(
    async (values: ScheduleTemplateFormValues) => {
      await save(values);
      onClose();
    },
    [onClose, save],
  );

  return (
    <StModal visible={visible} onClose={onClose}>
      <Typography weight="semibold" className="text-display text-center mb-2">
        Шаблон недели
      </Typography>

      <Typography
        weight="regular"
        className="text-neutral-500 text-body text-center mb-6"
      >
        Применяется к новым месяцам автоматически
      </Typography>

      <FormProvider {...methods}>
        <View style={{ maxHeight: height * 0.6 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-4">
              {days.map((_, index) => (
                <View key={index} className="gap-4">
                  <DayRow index={index} />
                  {index < days.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <Button
          title="Сохранить шаблон"
          buttonClassName="mt-6"
          rightIcon={
            <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
          }
          onPress={methods.handleSubmit(handleSave)}
        />
      </FormProvider>
    </StModal>
  );
};
