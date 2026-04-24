import React, { useState } from "react";
import { View } from "react-native";
import { FormProvider, useController, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountBookingSchema,
  type AccountBookingFormValues,
} from "@/src/validation/schemas/accountBooking.schema";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Item, StModal, StSvg, Typography } from "@/src/components/ui";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";
import { useAppSelector } from "@/src/store/redux/store";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import type { AppointmentStep } from "@/src/store/redux/services/api-types";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

const BOOKING_STEPS: { label: string; value: AppointmentStep }[] = [
  { label: "5 минут", value: "five_minutes" },
  { label: "10 минут", value: "ten_minutes" },
  { label: "15 минут", value: "fifteen_minutes" },
  { label: "30 минут", value: "thirty_minutes" },
  { label: "1 час", value: "one_hour" },
];

const formatStep = (value: AppointmentStep) => {
  return BOOKING_STEPS.find((s) => s.value === value)?.label ?? value;
};

function BookingStepField({ onSelect }: { onSelect: () => void }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { field } = useController<AccountBookingFormValues, "bookingStep">({
    name: "bookingStep",
  });

  return (
    <>
      <Item
        title="Шаг записи"
        right={
          <View className="flex-row items-center gap-1">
            <Typography className="text-neutral-500 text-body">
              {formatStep(field.value)}
            </Typography>
            <StSvg name="Expand_right" size={20} color={colors.neutral[400]} />
          </View>
        }
        onPress={() => setModalVisible(true)}
      />

      <StModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View className="gap-2">
          {BOOKING_STEPS.map((step) => (
            <Item
              key={step.value}
              title={step.label}
              onPress={() => {
                field.onChange(step.value);
                setModalVisible(false);
                onSelect();
              }}
              right={
                field.value === step.value ? (
                  <StSvg
                    name="Check_fill"
                    size={20}
                    color={colors.primary.blue[500]}
                  />
                ) : null
              }
            />
          ))}
        </View>
      </StModal>
    </>
  );
}

const Booking = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [updateUser] = useUpdateUserMutation();

  const methods = useForm<AccountBookingFormValues>({
    resolver: yupResolver(AccountBookingSchema),
    defaultValues: {
      autoConfirm: user?.is_auto_approve ?? true,
      bookingStep: user?.appointment_step ?? "one_hour",
    },
  });

  const onSubmit = async (values: AccountBookingFormValues) => {
    if (!user) return;
    try {
      await updateUser({
        id: user.id,
        data: {
          is_auto_approve: values.autoConfirm,
          appointment_step: values.bookingStep,
        },
      }).unwrap();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
    }
  };

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Бронирование">
        {({ topInset }) => (
          <View style={{ paddingTop: topInset + 16 }} className="px-screen">
            <View className="overflow-hidden gap-2">
              <Item
                title="Авто-подтверждение"
                right={
                  <RHFSwitch
                    name="autoConfirm"
                    onChange={() => methods.handleSubmit(onSubmit)()}
                  />
                }
              />
              <BookingStepField
                onSelect={() => methods.handleSubmit(onSubmit)()}
              />
            </View>
          </View>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default Booking;
