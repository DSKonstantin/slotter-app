import React, { useCallback, useEffect } from "react";
import { View, ScrollView } from "react-native";
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
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";
import {
  ScheduleTemplateSchema,
  type ScheduleTemplateFormValues,
} from "@/src/validation/schemas/scheduleTemplate.schema";
import { days } from "@/src/constants/days";
import { WorkingHoursFields } from "@/src/components/shared/timeFields/WorkingHoursFields";
import { useScheduleTemplate } from "@/src/hooks/useScheduleTemplate";

const DEFAULT_START_AT = new Date(2000, 0, 1, 9, 0);
const DEFAULT_END_AT = new Date(2000, 0, 1, 18, 0);

const DayRow = ({ index }: { index: number }) => {
  const { control } = useFormContext<ScheduleTemplateFormValues>();

  const isEnabled = useWatch({
    control,
    name: `days.${index}.isEnabled`,
  });

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Typography weight="semibold" className="text-body">
          {days[index].fullLabel}
        </Typography>
        <RHFSwitch name={`days.${index}.isEnabled`} />
      </View>

      {isEnabled && (
        <WorkingHoursFields
          startName={`days.${index}.startAt`}
          endName={`days.${index}.endAt`}
          breaksName={`days.${index}.breaks`}
          startDefault={DEFAULT_START_AT}
          endDefault={DEFAULT_END_AT}
          spacing="tight"
        />
      )}
    </View>
  );
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply?: (values: ScheduleTemplateFormValues) => void;
};

export const ScheduleTemplateModal = ({ visible, onClose, onApply }: Props) => {
  const { initialValues, save } = useScheduleTemplate();

  const methods = useForm<ScheduleTemplateFormValues>({
    resolver: yupResolver(ScheduleTemplateSchema),
    defaultValues: initialValues,
  });

  const handleSave = useCallback(
    async (values: ScheduleTemplateFormValues) => {
      await save(values);
      onClose();
    },
    [onClose, save],
  );

  const handleApply = useCallback(
    async (values: ScheduleTemplateFormValues) => {
      await save(values);
      onApply?.(values);
      onClose();
    },
    [onApply, onClose, save],
  );

  useEffect(() => {
    methods.reset(initialValues);
  }, [initialValues, methods]);

  return (
    <StModal visible={visible} onClose={onClose} fullHeight>
      <Typography weight="semibold" className="text-display text-center mb-2">
        Шаблон недели
      </Typography>

      <Typography
        weight="regular"
        className="text-neutral-500 text-body text-center mb-5"
      >
        Шаблон месяца, применяется сразу до конца месяца
      </Typography>

      <FormProvider {...methods}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View className="gap-4">
            {days.map((_, index) => (
              <View key={index} className="gap-4">
                <DayRow index={index} />
                {index < days.length - 1 && <Divider />}
              </View>
            ))}
          </View>
        </ScrollView>

        <Button
          title="Сохранить шаблон"
          buttonClassName="mt-6"
          rightIcon={
            <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
          }
          onPress={methods.handleSubmit(handleSave)}
        />
        <Button
          title="Применить шаблон"
          variant="secondary"
          buttonClassName="mt-3"
          rightIcon={
            <StSvg name="Check_fill" size={24} color={colors.neutral[900]} />
          }
          onPress={methods.handleSubmit(handleApply)}
        />
      </FormProvider>
    </StModal>
  );
};
