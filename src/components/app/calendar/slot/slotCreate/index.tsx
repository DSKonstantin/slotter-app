import React, { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Button,
  Card,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useCreateAppointmentMutation } from "@/src/store/redux/services/api/appointmentsApi";

const SlotCreateSchema = Yup.object({
  serviceName: Yup.string().required("Выберите услугу"),
  clientName: Yup.string(),
  date: Yup.string().required("Укажите дату"),
  time: Yup.string().required("Укажите время"),
  duration: Yup.number().min(1).required("Укажите длительность"),
  comment: Yup.string(),
  paymentMethod: Yup.string().oneOf(["cash", "sbp", "online"]).required(),
  sendNotification: Yup.boolean().required(),
});

type SlotCreateFormValues = Yup.InferType<typeof SlotCreateSchema>;

const PAYMENT_OPTIONS: { key: "cash" | "sbp" | "online"; label: string }[] = [
  { key: "cash", label: "Наличные" },
  { key: "sbp", label: "СБП" },
  { key: "online", label: "Онлайн-банк" },
];

interface Props {
  date?: string;
  time?: string;
  serviceId?: string;
  serviceName?: string;
  duration?: string;
}

const SlotCreate: React.FC<Props> = ({
  date,
  time,
  serviceId,
  serviceName,
  duration,
}) => {
  const auth = useRequiredAuth();
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const methods = useForm<SlotCreateFormValues>({
    resolver: yupResolver(SlotCreateSchema) as any,
    defaultValues: {
      serviceName: serviceName ?? "",
      clientName: "",
      date: date ?? "",
      time: time ?? "",
      duration: duration ? Number(duration) : 60,
      comment: "",
      paymentMethod: "cash",
      sendNotification: true,
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const paymentMethod = watch("paymentMethod");
  const watchedServiceName = watch("serviceName");
  const watchedDuration = watch("duration");
  const watchedTime = watch("time");

  const onSubmit = useCallback(
    async (values: SlotCreateFormValues) => {
      if (!auth) return;
      try {
        await createAppointment({
          userId: auth.userId,
          body: {
            date: values.date,
            start_time: values.time,
            ...(serviceId && { service_ids: [Number(serviceId)] }),
            customer_id: 2,
            duration: values.duration,
            payment_method:
              values.paymentMethod === "online"
                ? "online_bank"
                : values.paymentMethod,
            comment: values.comment,
            send_notification: values.sendNotification,
          },
        }).unwrap();
        toast.success("Запись создана");
        router.back();
      } catch (error: any) {
        toast.error(error?.data?.error ?? "Не удалось создать запись");
      }
    },
    [auth, serviceId, createAppointment],
  );

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать слот">
        {({ topInset, bottomInset }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: bottomInset + 16,
              paddingHorizontal: 20,
            }}
            style={{ marginTop: topInset }}
          >
            {watchedServiceName ? (
              <Card
                title={watchedServiceName}
                subtitle={[
                  watchedDuration && `${watchedDuration} мин`,
                  watchedTime,
                ]
                  .filter(Boolean)
                  .join(" | ")}
                className="bg-primary-blue-500"
                titleProps={{
                  style: {
                    color: colors.neutral[0],
                  },
                }}
                subtitleProps={{
                  style: {
                    color: colors.neutral[0],
                  },
                }}
                right={
                  <IconButton
                    size="sm"
                    buttonClassName="bg-transparent"
                    icon={
                      <StSvg
                        name="Close_round"
                        size={24}
                        color={colors.neutral[0]}
                      />
                    }
                    onPress={() => router.back()}
                  />
                }
              />
            ) : (
              <View className="mt-4">
                <RhfTextField
                  label="Услуга"
                  name="serviceName"
                  placeholder="Выберите услугу"
                />
              </View>
            )}
            <View className="mt-5 gap-2">
              <RhfTextField
                name="clientName"
                label="Клиент"
                placeholder="Поиск по имени или телефону"
                hideErrorText
              />
              <Button
                title=" Создать нового клиента"
                variant="clear"
                onPress={() => router.push(Routers.app.clients.create)}
                rightIcon={
                  <StSvg
                    name="Add_round_fill"
                    size={24}
                    color={colors.neutral[900]}
                  />
                }
              />
            </View>

            <View className="flex-row gap-3 mt-5">
              <View className="flex-1">
                <RhfTextField label="Дата" name="date" placeholder="дд.мм" />
              </View>
              <View className="flex-1">
                <RhfTextField label="Время" name="time" placeholder="чч:мм" />
              </View>
            </View>

            <View className="mt-1">
              <RhfTextField
                label="Изменить продолжительность (мин)"
                placeholder="60"
                name="duration"
              />
            </View>

            <View className="mt-1">
              <RhfTextField
                label="Комментарий"
                name="comment"
                placeholder="Добавить заметку к записи..."
                multiline
              />
            </View>

            <View className="mt-1">
              <Typography className="text-caption text-neutral-500 mb-2">
                Способ оплаты
              </Typography>
              <View className="gap-2">
                {PAYMENT_OPTIONS.map(({ key, label }) => (
                  <Card
                    key={key}
                    title={label}
                    active={paymentMethod === key}
                    onPress={() => setValue("paymentMethod", key)}
                  />
                ))}
              </View>
            </View>

            <Card
              title="Отправить уведомление"
              className="mt-1"
              right={<RHFSwitch name="sendNotification" />}
            />

            <View className="mt-8 gap-3">
              <Button
                title="Создать запись"
                loading={isLoading}
                onPress={handleSubmit(onSubmit)}
                rightIcon={
                  <StSvg
                    name="Add_round_fill"
                    size={24}
                    color={colors.neutral[0]}
                  />
                }
              />
            </View>
          </ScrollView>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default SlotCreate;
