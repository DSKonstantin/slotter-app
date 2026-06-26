import React, { useCallback } from "react";
import { View } from "react-native";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";

import { Button } from "@/src/components/ui/Button";
import { Typography } from "@/src/components/ui/Typography";
import { WorkingHoursFields } from "@/src/components/shared/timeFields/WorkingHoursFields";
import {
  DEFAULT_BREAK_END,
  DEFAULT_BREAK_START,
  DEFAULT_END_AT,
  DEFAULT_START_AT,
} from "@/src/constants/hoursOptions";
import {
  useCreateWorkingDayMutation,
  useUpdateWorkingDayMutation,
} from "@/src/store/redux/services/api/workingDaysApi";
import {
  DayScheduleSchema,
  type DayScheduleFormValues,
} from "@/src/validation/schemas/daySchedule.schema";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { formatDayMonthLong } from "@/src/utils/date/formatDate";
import type { WorkingDayStatus } from "@/src/hooks/useWorkingDaysCalendar";
import { Image } from "expo-image";
import notWorkingImage from "@/assets/images/app/not-working.png";

type Props = {
  date: string;
  status: Exclude<WorkingDayStatus, "working">;
  workingDayId?: number;
  userId: number;
  onSuccess: (date: string) => void;
};

const NonWorkingDayPanel = ({
  date,
  status,
  workingDayId,
  userId,
  onSuccess,
}: Props) => {
  const [createWorkingDay, { isLoading: isCreating }] =
    useCreateWorkingDayMutation();
  const [updateWorkingDay, { isLoading: isUpdating }] =
    useUpdateWorkingDayMutation();
  const isLoading = isCreating || isUpdating;

  const dateLabel = date ? formatDayMonthLong(new Date(date)) : "этот день";

  const methods = useForm<DayScheduleFormValues>({
    resolver: yupResolver(DayScheduleSchema) as Resolver<DayScheduleFormValues>,
    defaultValues: { isActive: true, date, startAt: "", endAt: "", breaks: [] },
  });

  const handleActivate = useCallback(async () => {
    if (!workingDayId) return;
    try {
      await updateWorkingDay({
        userId,
        id: workingDayId,
        data: { is_active: true },
      }).unwrap();
      onSuccess(date);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось включить рабочий день"));
    }
  }, [workingDayId, userId, updateWorkingDay, date, onSuccess]);

  const handleCreate = useCallback(
    async (data: DayScheduleFormValues) => {
      try {
        await createWorkingDay({
          userId,
          data: {
            day: date,
            start_at: data.startAt,
            end_at: data.endAt,
            is_active: true,
            ...(data.breaks.length > 0 && {
              working_day_breaks_attributes: data.breaks.map((b) => ({
                start_at: b.start,
                end_at: b.end,
              })),
            }),
          },
        }).unwrap();
        onSuccess(date);
      } catch (e) {
        toast.error(getApiErrorMessage(e, "Не удалось создать рабочий день"));
      }
    },
    [userId, date, createWorkingDay, onSuccess],
  );

  if (status === "inactive") {
    return (
      <View className="gap-4 flex-1 justify-between">
        <View className="flex-1 items-center justify-center">
          <Image
            source={notWorkingImage}
            style={{ width: 160, height: 142 }}
            contentFit="contain"
            accessible={false}
          />
          <Typography className="text-body text-center">
            {dateLabel} отмечен как выходной. Хотите сделать день рабочим?
          </Typography>
        </View>

        <Button
          title="Включить рабочий день"
          variant="accent"
          loading={isLoading}
          disabled={isLoading}
          onPress={handleActivate}
        />
      </View>
    );
  }

  return (
    <View className="gap-4 flex-1 justify-between">
      <View className="gap-2">
        <Typography className="text-body text-neutral-500">
          Для {dateLabel} ещё не настроено расписание. Укажите рабочие часы для
          создания и приёма записей.
        </Typography>
        <FormProvider {...methods}>
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
        </FormProvider>
      </View>

      <Button
        title="Создать и выбрать дату"
        loading={isLoading}
        disabled={isLoading}
        onPress={methods.handleSubmit(handleCreate)}
      />
    </View>
  );
};

export default NonWorkingDayPanel;
