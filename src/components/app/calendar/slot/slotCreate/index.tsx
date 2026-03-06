import React, { useCallback } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";

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
}

const SlotCreate: React.FC<Props> = ({
  date,
  time,
  serviceId,
  serviceName,
}) => {
  const { bottom } = useSafeAreaInsets();

  const methods = useForm<SlotCreateFormValues>({
    resolver: yupResolver(SlotCreateSchema) as any,
    defaultValues: {
      serviceName: serviceName ?? "",
      clientName: "",
      date: date ?? "",
      time: time ?? "",
      duration: 60,
      comment: "",
      paymentMethod: "cash",
      sendNotification: true,
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const paymentMethod = watch("paymentMethod");
  const watchedServiceName = watch("serviceName");

  const onSubmit = useCallback(async (values: SlotCreateFormValues) => {
    try {
      // TODO: connect real API
      toast.success("Запись создана");
    } catch (error) {
      toast.error("Не удалось создать запись");
    }
  }, []);

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать слот">
        {({ topInset }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: TAB_BAR_HEIGHT + bottom + 24,
              paddingHorizontal: 20,
            }}
            style={{ marginTop: topInset }}
          >
            {/* Service */}
            {watchedServiceName ? (
              <View className="flex-row items-center justify-between bg-primary-blue-500 rounded-base px-4 py-3 mt-4">
                <Typography
                  weight="medium"
                  className="text-body text-neutral-0 flex-1"
                >
                  {watchedServiceName}
                </Typography>
                <TouchableOpacity onPress={() => router.back()}>
                  <StSvg name="Close" size={20} color={colors.neutral[0]} />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mt-4">
                <RhfTextField
                  label="Услуга"
                  name="serviceName"
                  placeholder="Выберите услугу"
                />
              </View>
            )}

            {/* Client */}
            <View className="mt-4">
              <RhfTextField
                name="clientName"
                label="Клиент"
                placeholder="Поиск по имени или телефону"
              />
              <TouchableOpacity
                className="flex-row items-center gap-2 mt-2 py-2"
                onPress={() => router.push(Routers.app.clients.create)}
              >
                <StSvg
                  name="Add_round_fill"
                  size={20}
                  color={colors.primary.blue[500]}
                />
                <Typography className="text-body text-primary-blue-500">
                  Создать нового клиента
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Date + Time */}
            <View className="flex-row gap-3 mt-4">
              <View className="flex-1">
                <RhfTextField label="Дата" name="date" placeholder="дд.мм" />
              </View>
              <View className="flex-1">
                <RhfTextField label="Время" name="time" placeholder="чч:мм" />
              </View>
            </View>

            {/* Duration */}
            <View className="mt-4">
              <RhfTextField
                label="Изменить продолжительность (мин)"
                placeholder="60"
                name="duration"
              />
            </View>

            {/* Comment */}
            <View className="mt-4">
              <RhfTextField
                label="Комментарий"
                name="comment"
                placeholder="Добавить заметку к записи..."
                multiline
              />
            </View>

            {/* Payment method */}
            <View className="mt-6">
              <Typography className="text-caption text-neutral-500 mb-2">
                Способ оплаты
              </Typography>
              <View className="gap-2">
                {PAYMENT_OPTIONS.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setValue("paymentMethod", key)}
                    className={`px-4 py-4 rounded-base border ${
                      paymentMethod === key
                        ? "border-primary-blue-500 bg-primary-blue-50"
                        : "border-neutral-200 bg-background-surface"
                    }`}
                  >
                    <Typography
                      weight={paymentMethod === key ? "medium" : "regular"}
                      className={`text-body ${
                        paymentMethod === key
                          ? "text-primary-blue-500"
                          : "text-neutral-900"
                      }`}
                    >
                      {label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notification */}
            <View className="mt-6 flex-row items-center justify-between">
              <Typography className="text-body">
                Отправить уведомление
              </Typography>
              <RHFSwitch name="sendNotification" />
            </View>

            {/* Submit */}
            <View className="mt-8 gap-3">
              <Button
                title="Создать запись"
                onPress={handleSubmit(onSubmit)}
                rightIcon={
                  <StSvg
                    name="Add_round_fill"
                    size={24}
                    color={colors.neutral[0]}
                  />
                }
              />
              <TouchableOpacity className="flex-row items-center justify-center gap-2 py-3">
                <Typography className="text-body text-primary-blue-500">
                  Отправить ссылку на бронирование
                </Typography>
                <StSvg name="Link" size={20} color={colors.primary.blue[500]} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default SlotCreate;
