import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { parseISO } from "date-fns";
import { formatDayMonthLong } from "@/src/utils/date/formatDate";
import { RhfCalendarDatePicker } from "@/src/components/hookForm/rhf-calendar-date-picker";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
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
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  clearSlotDraft,
  setSlotDraft,
} from "@/src/store/redux/slices/slotDraftSlice";
import { useCreateAppointmentMutation } from "@/src/store/redux/services/api/appointmentsApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import ComingSoonModal from "@/src/components/shared/modals/ComingSoonModal";

const SlotCreateSchema = Yup.object({
  services: Yup.array(
    Yup.object({
      id: Yup.string().required(),
      name: Yup.string().required(),
      duration: Yup.number().required(),
      priceCents: Yup.number().required(),
    }),
  ).required(),
  clientName: Yup.string(),
  date: Yup.string().required("Укажите дату"),
  time: Yup.string().required("Укажите время"),
  duration: Yup.number()
    .min(0, "Минимальная длительность — 0 минут")
    .required("Укажите длительность"),
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

const SlotCreate: React.FC = () => {
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.slotDraft);
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const initialServices = draft.services.map((s) => ({
    id: String(s.id),
    name: s.name,
    duration: s.duration,
    priceCents: s.price_cents,
  }));

  const methods = useForm<SlotCreateFormValues>({
    resolver: yupResolver(SlotCreateSchema) as any,
    defaultValues: {
      services: initialServices,
      clientName: "",
      date: draft.date ?? "",
      time: draft.time ?? "",
      duration: initialServices.reduce((sum, s) => sum + s.duration, 0) || 60,
      comment: "",
      paymentMethod: "cash",
      sendNotification: true,
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const watchedServices = watch("services");
  const paymentMethod = watch("paymentMethod");
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  const { fields, remove } = useFieldArray({
    control: methods.control,
    name: "services",
  });

  const handleRemoveAdditional = useCallback(
    (id: number) => {
      dispatch(
        setSlotDraft({
          ...draft,
          additionalServices: draft.additionalServices.filter(
            (s) => s.id !== id,
          ),
        }),
      );
    },
    [dispatch, draft],
  );

  const handleRemoveService = useCallback(
    (index: number) => {
      if (fields.length === 1) {
        router.back();
        return;
      }
      remove(index);
      const next = methods.getValues("services");
      setValue(
        "duration",
        next.reduce((sum, s) => sum + s.duration, 0),
      );
    },
    [fields.length, remove, methods, setValue],
  );

  const onSubmit = useCallback(
    async (values: SlotCreateFormValues) => {
      if (!auth) return;
      try {
        await createAppointment({
          userId: auth.userId,
          body: {
            date: values.date,
            start_time: values.time,
            ...(values.services.length > 0 && {
              service_ids: values.services.map((s) => Number(s.id)),
            }),
            ...(draft.additionalServices.length > 0 && {
              additional_service_ids: draft.additionalServices.map((s) => s.id),
            }),
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
        dispatch(clearSlotDraft());
        toast.success("Запись создана");
        router.push(Routers.app.calendar.root(values.date));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось создать запись"));
      }
    },
    [auth, draft.additionalServices, createAppointment, dispatch],
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
            {fields.length > 0 && (
              <View className="gap-2">
                <Typography className="text-caption text-neutral-500">
                  Услуга
                </Typography>
                {fields.map((field, index) => (
                  <Card
                    key={field.id}
                    title={field.name}
                    subtitle={[
                      field.duration && `${field.duration} мин`,
                      field.priceCents &&
                        formatRublesFromCents(field.priceCents),
                    ]
                      .filter(Boolean)
                      .join(" | ")}
                    className="bg-primary-blue-500"
                    titleProps={{ style: { color: colors.neutral[0] } }}
                    subtitleProps={{ style: { color: colors.neutral[0] } }}
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
                        onPress={() => handleRemoveService(index)}
                      />
                    }
                  />
                ))}
              </View>
            )}

            {draft.additionalServices.length > 0 && (
              <View className="gap-2 mt-2">
                <Typography className="text-caption text-neutral-500">
                  Дополнительные услуги
                </Typography>
                {draft.additionalServices.map((service) => (
                  <Card
                    key={service.id}
                    title={service.name}
                    subtitle={[
                      service.duration && `${service.duration} мин`,
                      service.price_cents &&
                        formatRublesFromCents(service.price_cents),
                    ]
                      .filter(Boolean)
                      .join(" | ")}
                    className="bg-background-surface"
                    right={
                      <IconButton
                        size="sm"
                        buttonClassName="bg-transparent"
                        icon={
                          <StSvg
                            name="Close_round"
                            size={24}
                            color={colors.neutral[500]}
                          />
                        }
                        onPress={() => handleRemoveAdditional(service.id)}
                      />
                    }
                  />
                ))}
              </View>
            )}

            {(fields.length > 0 || draft.additionalServices.length > 0) && (
              <View className="flex-row justify-between items-center mt-3">
                <Typography className="text-body text-neutral-500">
                  Итого
                </Typography>
                <Typography
                  weight="semibold"
                  className="text-body text-neutral-900"
                >
                  {formatRublesFromCents(
                    watchedServices.reduce(
                      (sum, s) => sum + (s.priceCents ?? 0),
                      0,
                    ) +
                      draft.additionalServices.reduce(
                        (sum, s) => sum + (s.price_cents ?? 0),
                        0,
                      ),
                  )}
                </Typography>
              </View>
            )}

            <View className="mt-5 gap-2">
              <RhfTextField
                name="clientName"
                label="Клиент"
                placeholder="Поиск по имени или телефону"
                hideErrorText
                startAdornment={
                  <StSvg name="Search" size={24} color={colors.neutral[900]} />
                }
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
                <RhfCalendarDatePicker
                  name="date"
                  label="Дата"
                  placeholder="дд.мм"
                  displayFormat={(iso) => formatDayMonthLong(parseISO(iso))}
                  endAdornment={
                    <StSvg
                      name="Date_today"
                      size={24}
                      color={colors.neutral[500]}
                    />
                  }
                />
              </View>
              <View className="flex-1">
                <RhfTextField
                  label="Время"
                  name="time"
                  placeholder="чч:мм"
                  endAdornment={
                    <StSvg
                      name="Time_light"
                      size={24}
                      color={colors.neutral[500]}
                    />
                  }
                />
              </View>
            </View>

            <View className="mt-1">
              <RhfTextField
                name="duration"
                label="Изменить продолжительность (мин)"
                placeholder="60"
                keyboardType="number-pad"
                maxLength={4}
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
                    className={key === "online" ? "opacity-40" : ""}
                    onPress={() => {
                      if (key === "online") {
                        setComingSoonVisible(true);
                        return;
                      }
                      setValue("paymentMethod", key);
                    }}
                  />
                ))}
              </View>
            </View>

            <Card
              title="Отправить уведомление"
              className="mt-5"
              left={<StSvg name="Bell" size={24} color={colors.neutral[500]} />}
              right={<RHFSwitch name="sendNotification" />}
            />

            <View className="mt-5 gap-3">
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

      <ComingSoonModal
        visible={comingSoonVisible}
        onClose={() => setComingSoonVisible(false)}
      />
    </FormProvider>
  );
};

export default SlotCreate;
