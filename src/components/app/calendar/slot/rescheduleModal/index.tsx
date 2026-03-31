import React, { memo } from "react";
import { View, ActivityIndicator } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { StModal, Button, Typography, Card, StSvg } from "@/src/components/ui";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import {
  useRescheduleAppointmentMutation,
  useGetAvailableSlotsQuery,
} from "@/src/store/redux/services/api/appointmentsApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { toast } from "@backpackapp-io/react-native-toast";
import { colors } from "@/src/styles/colors";
import { router } from "expo-router";
import { parseISO } from "date-fns";
import { formatDayMonthLong } from "@/src/utils/date/formatDate";
import { formatDayMonth } from "@/src/utils/date/formatTime";
import { skipToken } from "@reduxjs/toolkit/query";

type Props = {
  visible: boolean;
  appointmentId: number;
  defaultDate?: string;
  onClose: () => void;
};

const rescheduleSchema = Yup.object({
  date: Yup.string()
    .required("Укажите дату")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Формат: YYYY-MM-DD"),
  start_time: Yup.string().required("Выберите время"),
  reason: Yup.string(),
  send_notification: Yup.boolean().required(),
});

const RescheduleModal = ({
  visible,
  appointmentId,
  defaultDate = "",
  onClose,
}: Props) => {
  const auth = useRequiredAuth();

  const methods = useForm({
    resolver: yupResolver(rescheduleSchema),
    defaultValues: {
      date: defaultDate,
      start_time: "",
      reason: "",
      send_notification: true,
    },
  });
  const { watch, setValue } = methods;

  const dateValue = watch("date");
  const selectedTime = watch("start_time");

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateValue ?? "");

  const { data: availableSlots, isFetching: isFetchingSlots } =
    useGetAvailableSlotsQuery(
      auth
        ? {
            userId: auth.userId,
            date: dateValue,
            step: 15,
            appointment_id: appointmentId,
          }
        : skipToken,

      {
        skip: !visible || !isValidDate,
        refetchOnMountOrArgChange: true,
      },
    );

  const [reschedule, { isLoading }] = useRescheduleAppointmentMutation();

  const handleSubmit = methods.handleSubmit(async (values) => {
    try {
      await reschedule({
        id: appointmentId,
        body: { date: values.date, start_time: values.start_time },
      }).unwrap();
      methods.reset({
        date: defaultDate,
        start_time: "",
        reason: "",
        send_notification: true,
      });
      onClose();
      toast.success("Запись перенесена");
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось перенести запись"));
    }
  });

  const handleClose = () => {
    methods.reset({
      date: defaultDate,
      start_time: "",
      reason: "",
      send_notification: true,
    });
    onClose();
  };

  return (
    <StModal visible={visible} onClose={handleClose} keyboardAware>
      <FormProvider {...methods}>
        <Typography weight="semibold" className="text-display text-center mb-5">
          Перенести запись с {formatDayMonth(defaultDate)}
        </Typography>

        <View>
          <RhfTextField
            name="date"
            label="Новая дата"
            placeholder="YYYY-MM-DD"
            hideErrorText={true}
          />

          {isFetchingSlots && (
            <View className="items-center mt-5">
              <ActivityIndicator color={colors.neutral[400]} />
            </View>
          )}

          {!isFetchingSlots && availableSlots && availableSlots.length > 0 && (
            <View className="mt-5 gap-5">
              <View className="gap-2">
                <Typography className="text-caption text-neutral-500">
                  Новое время
                </Typography>
                <View className="flex-row flex-wrap gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <Button
                        key={slot}
                        title={slot}
                        variant={isSelected ? "accent" : "secondary"}
                        buttonClassName="rounded-small px-3"
                        onPress={() => setValue("start_time", slot)}
                      />
                    );
                  })}
                </View>
              </View>

              <RhfTextField
                name="reason"
                label="Причина переноса"
                placeholder="Будет отправлено клиенту"
                hideErrorText={true}
                multiline={true}
              />

              <Card
                title="Отправить уведомление"
                left={
                  <StSvg name="Bell" size={24} color={colors.neutral[600]} />
                }
                right={<RHFSwitch name="send_notification" />}
              />
            </View>
          )}

          {!isFetchingSlots && isValidDate && availableSlots?.length === 0 && (
            <Typography className="text-caption text-neutral-400 mt-5 text-center">
              Нет доступных слотов на эту дату
            </Typography>
          )}
        </View>

        <View className="mt-6 gap-3">
          <Button
            title="Перенести"
            onPress={handleSubmit}
            loading={isLoading}
          />
          <Button title="Отмена" variant="secondary" onPress={handleClose} />
        </View>
      </FormProvider>
    </StModal>
  );
};

export default memo(RescheduleModal);
