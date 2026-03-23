import React, { useState } from "react";
import { View } from "react-native";
import { FormProvider, useController, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Divider, Item, StModal, StSvg, Typography } from "@/src/components/ui";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";

type FormValues = {
  autoConfirm: boolean;
  bookingStep: string;
  prepayment: boolean;
};

const schema = Yup.object({
  autoConfirm: Yup.boolean().required(),
  bookingStep: Yup.string().required(),
  prepayment: Yup.boolean().required(),
});

const BOOKING_STEPS = [
  { label: "15 минут", value: "15" },
  { label: "30 минут", value: "30" },
  { label: "1 час", value: "60" },
  { label: "2 часа", value: "120" },
];

const formatStep = (value: string) => {
  return BOOKING_STEPS.find((s) => s.value === value)?.label ?? value;
};

function BookingStepField() {
  const [modalVisible, setModalVisible] = useState(false);
  const { field } = useController({ name: "bookingStep" });

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
  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      autoConfirm: false,
      bookingStep: "60",
      prepayment: false,
    },
  });

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Бронирование">
        {({ topInset }) => (
          <View style={{ paddingTop: topInset + 16 }} className="px-screen">
            <View className="overflow-hidden gap-2">
              <Item
                title="Авто-подтверждение"
                right={<RHFSwitch name="autoConfirm" />}
              />
              <BookingStepField />
              <Item
                title="Предоплата"
                right={<RHFSwitch name="prepayment" />}
              />
            </View>
          </View>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default Booking;
