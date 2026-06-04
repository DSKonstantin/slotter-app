import React, { memo, useMemo, useState } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { StModal, Button, Typography, Card, StSvg } from "@/src/components/ui";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { RhfCalendarDatePicker } from "@/src/components/hookForm/rhf-calendar-date-picker";
import {
  useRescheduleAppointmentMutation,
  useGetAvailableSlotsQuery,
} from "@/src/store/redux/services/api/appointmentsApi";
import { RescheduleSchema } from "@/src/validation/schemas/slotReschedule.schema";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { toast } from "@backpackapp-io/react-native-toast";
import { colors } from "@/src/styles/colors";
import { parseISO } from "date-fns";
import { formatDayMonthLong, formatSlotDate } from "@/src/utils/date/formatDate";
import { formatDayMonth } from "@/src/utils/date/formatTime";
import { skipToken } from "@reduxjs/toolkit/query";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import RetryInline from "@/src/components/shared/retryInline";
import { useSlotStep } from "@/src/hooks/useSlotStep";
import { groupSlotsByHour } from "@/src/utils/schedule/groupSlotsByHour";

type Props = {
  visible: boolean;
  appointmentId: number;
  defaultDate?: string;
  onClose: () => void;
};

const RescheduleModal = ({
  visible,
  appointmentId,
  defaultDate = "",
  onClose,
}: Props) => {
  const auth = useRequiredAuth();
  const { stepMinutes, useHourGrouping } = useSlotStep();

  const [hourPickerOpen, setHourPickerOpen] = useState<string | null>(null);

  const methods = useForm({
    resolver: yupResolver(RescheduleSchema),
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

  const {
    data: availableSlots,
    isFetching: isFetchingSlots,
    isError: isSlotsError,
    refetch: refetchSlots,
  } = useGetAvailableSlotsQuery(
    auth
      ? {
          userId: auth.userId,
          date: formatSlotDate(parseISO(dateValue)),
          step: stepMinutes,
          appointment_id: appointmentId,
        }
      : skipToken,

    {
      skip: !visible || !isValidDate,
      refetchOnMountOrArgChange: true,
    },
  );

  const slotsByHour = useMemo(
    () => groupSlotsByHour(availableSlots ?? []),
    [availableSlots],
  );

  const hourPickerSlots = hourPickerOpen
    ? (slotsByHour.get(hourPickerOpen) ?? [])
    : [];

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
    <StModal
      visible={visible}
      onClose={handleClose}
      keyboardAware
      keyboardAwareBottomOffset={BOTTOM_OFFSET}
    >
      <FormProvider {...methods}>
        <Typography weight="semibold" className="text-display text-center mb-5">
          Перенести запись с {formatDayMonth(defaultDate)}
        </Typography>

        <View>
          <RhfCalendarDatePicker
            name="date"
            label="Новая дата"
            placeholder="дд.мм"
            hideErrorText={true}
            displayFormat={(iso) => formatDayMonthLong(parseISO(iso))}
            endAdornment={
              <StSvg name="Date_today" size={24} color={colors.neutral[500]} />
            }
          />

          {isFetchingSlots && (
            <View className="items-center mt-5">
              <ActivityIndicator color={colors.neutral[400]} />
            </View>
          )}

          {!isFetchingSlots && availableSlots && availableSlots.length > 0 && (
            <View className="mt-5 gap-5">
              <View className="gap-2">
                {useHourGrouping && hourPickerOpen ? (
                  <>
                    <Pressable
                      className="flex-row items-center gap-1 active:opacity-70 self-start"
                      onPress={() => setHourPickerOpen(null)}
                    >
                      <StSvg
                        name="Expand_left"
                        size={18}
                        color={colors.neutral[500]}
                      />
                      <Typography className="text-caption text-neutral-500">
                        {hourPickerOpen}:00
                      </Typography>
                    </Pressable>
                    <View className="flex-row flex-wrap gap-2">
                      {hourPickerSlots.map((slot) => {
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
                  </>
                ) : (
                  <>
                    <Typography className="text-caption text-neutral-500">
                      Новое время
                      {useHourGrouping && selectedTime ? (
                        <Typography className="text-caption text-neutral-900">
                          {" — "}
                          {selectedTime}
                        </Typography>
                      ) : null}
                    </Typography>
                    <View className="flex-row flex-wrap gap-2">
                      {useHourGrouping
                        ? Array.from(slotsByHour.keys()).map((hour) => {
                            const isSelected = selectedTime?.startsWith(
                              `${hour}:`,
                            );
                            return (
                              <Button
                                key={hour}
                                title={`${hour}:00`}
                                variant={isSelected ? "accent" : "secondary"}
                                buttonClassName="rounded-small px-3"
                                onPress={() => setHourPickerOpen(hour)}
                              />
                            );
                          })
                        : availableSlots.map((slot) => {
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
                  </>
                )}
              </View>

              <RhfTextField
                name="reason"
                label="Причина переноса"
                placeholder="Будет отправлено клиенту"
                hideErrorText={true}
                multiline={true}
                numberOfLines={4}
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

          {!isFetchingSlots && isSlotsError && (
            <View className="mt-5">
              <RetryInline
                text="Не удалось загрузить слоты"
                onRetry={refetchSlots}
              />
            </View>
          )}

          {!isFetchingSlots &&
            !isSlotsError &&
            isValidDate &&
            availableSlots?.length === 0 && (
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
