import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { parseISO } from "date-fns";
import { formatDayMonthLong } from "@/src/utils/date/formatDate";
import { RhfCalendarDatePicker } from "@/src/components/hookForm/rhf-calendar-date-picker";
import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { RhfDurationPicker } from "@/src/components/hookForm/rhf-duration-picker";
import { formatTime } from "@/src/utils/date/formatTime";
import { useForm, useFieldArray } from "react-hook-form";
import { RhfFormProvider } from "@/src/components/hookForm/rhf-form-provider";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";
import {
  SlotCreateSchema,
  type SlotCreateFormValues,
} from "@/src/validation/schemas/slotCreate.schema";

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
import CustomerSelect from "@/src/components/app/calendar/slot/slotCreate/customerSelect";
import { setHighlightSlotId } from "@/src/store/redux/slices/calendarSlice";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import ComingSoonModal from "@/src/components/shared/modals/ComingSoonModal";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";

const PAYMENT_OPTIONS: { key: "cash" | "sbp" | "online"; label: string }[] = [
  { key: "cash", label: "Наличные" },
  { key: "sbp", label: "СБП" },
  { key: "online", label: "Онлайн-банк" },
];

const SlotCreate: React.FC = () => {
  const auth = useRequiredAuth();
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.slotDraft);
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const initialServices = useMemo(
    () =>
      draft.services.map((s) => ({
        id: String(s.id),
        name: s.name,
        duration: s.duration,
        priceCents: s.price_cents,
      })),
    [draft.services],
  );

  const methods = useForm<SlotCreateFormValues>({
    resolver: yupResolver(SlotCreateSchema),
    defaultValues: {
      services: initialServices,
      customerId: undefined,
      date: draft.date ?? "",
      time: draft.time ?? "",
      duration:
        initialServices.reduce((sum, s) => sum + s.duration, 0) +
          draft.additionalServices.reduce((sum, s) => sum + s.duration, 0) ||
        60,
      comment: "",
      paymentMethod: "cash",
      sendNotification: true,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;
  const watchedServices = watch("services");
  const paymentMethod = watch("paymentMethod");

  const { fields, remove } = useFieldArray({
    control: methods.control,
    name: "services",
  });

  const servicesError = errors.services?.message;

  const handleRemoveAdditional = useCallback(
    (id: number) => {
      const nextAdditional = draft.additionalServices.filter(
        (s) => s.id !== id,
      );
      dispatch(
        setSlotDraft({
          ...draft,
          additionalServices: nextAdditional,
        }),
      );
      const services = methods.getValues("services");
      setValue(
        "duration",
        services.reduce((sum, s) => sum + s.duration, 0) +
          nextAdditional.reduce((sum, s) => sum + s.duration, 0),
      );
    },
    [dispatch, draft, methods, setValue],
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
        next.reduce((sum, s) => sum + s.duration, 0) +
          draft.additionalServices.reduce((sum, s) => sum + s.duration, 0),
      );
    },
    [fields.length, remove, methods, setValue, draft.additionalServices],
  );

  const onSubmit = useCallback(
    async (values: SlotCreateFormValues) => {
      if (!auth) return;
      try {
        const result = await createAppointment({
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
            customer_id: values.customerId,
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
        dispatch(setHighlightSlotId(result.id));
        methods.reset(values);
        router.dismissAll();
        router.replace(Routers.app.calendar.root(values.date));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось создать запись"));
      }
    },
    [auth, createAppointment, draft.additionalServices, dispatch, methods],
  );

  return (
    <RhfFormProvider methods={methods} offset={0}>
      {({ setScrollRef, contentRef, scrollToError }) => (
        <>
          <ScreenWithToolbar title="Создать слот">
            {({ topInset, bottomInset }) => (
              <KeyboardAwareScrollView
                ref={setScrollRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bottomOffset={BOTTOM_OFFSET}
                contentContainerStyle={{
                  paddingTop: topInset,
                  paddingBottom: bottomInset + 8,
                  paddingHorizontal: SCREEN_PADDING,
                }}
              >
                <View ref={contentRef} collapsable={false}>
                  <View className="gap-2">
                    <Typography className="text-caption text-neutral-500">
                      Услуга
                    </Typography>
                    {fields.length > 0 ? (
                      fields.map((field, index) => (
                        <Card
                          key={field.id}
                          title={field.name}
                          subtitle={[
                            `${field.duration} мин`,
                            field.priceCents &&
                              formatRublesFromCents(field.priceCents),
                          ]
                            .filter(Boolean)
                            .join(" | ")}
                          className="bg-primary-blue-500"
                          titleProps={{ style: { color: colors.neutral[0] } }}
                          subtitleProps={{
                            style: { color: colors.neutral[0] },
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
                              onPress={() => handleRemoveService(index)}
                            />
                          }
                        />
                      ))
                    ) : (
                      <Card
                        title="Услуга не выбрана"
                        subtitle="Добавьте услугу"
                        className={
                          servicesError ? "border-accent-red-500" : undefined
                        }
                        onPress={() =>
                          router.push(
                            Routers.app.createSlotFlow.selectService(),
                          )
                        }
                        right={
                          <StSvg
                            name="Add_round"
                            size={24}
                            color={colors.primary.blue[500]}
                          />
                        }
                      />
                    )}

                    {servicesError && (
                      <Typography className="text-caption text-accent-red-500 font-inter-medium mt-[2px]">
                        {servicesError}
                      </Typography>
                    )}
                  </View>

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

                  {(fields.length > 0 ||
                    draft.additionalServices.length > 0) && (
                    <View className="flex-row justify-between items-center mt-3 mb-5">
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

                  <CustomerSelect />

                  <View className="flex-row gap-3 mt-5">
                    <View className="flex-1">
                      <RhfCalendarDatePicker
                        name="date"
                        label="Дата"
                        placeholder="дд.мм"
                        displayFormat={(iso) =>
                          formatDayMonthLong(parseISO(iso))
                        }
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
                      <RhfDatePicker
                        name="time"
                        label="Время"
                        placeholder="чч:мм"
                        formatValue={(date: Date) => formatTime(date)}
                        parseValue={(value) => {
                          if (!value || typeof value !== "string") return null;
                          const [hours, minutes] = value.split(":").map(Number);
                          const d = new Date();
                          d.setHours(hours, minutes, 0, 0);
                          return d;
                        }}
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
                    <RhfDurationPicker
                      name="duration"
                      label="Изменить продолжительность (мин)"
                      placeholder="Выберите длительность"
                    />
                  </View>

                  <View className="mt-1">
                    <RhfTextField
                      label="Комментарий"
                      name="comment"
                      placeholder="Добавить заметку к записи..."
                      multiline
                      numberOfLines={4}
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
                    left={
                      <StSvg
                        name="Bell"
                        size={24}
                        color={colors.neutral[500]}
                      />
                    }
                    right={<RHFSwitch name="sendNotification" />}
                  />

                  <View className="mt-5 gap-3">
                    <Button
                      title="Создать запись"
                      loading={isLoading}
                      onPress={handleSubmit(onSubmit, scrollToError)}
                      rightIcon={
                        <StSvg
                          name="Add_round_fill"
                          size={24}
                          color={colors.neutral[0]}
                        />
                      }
                    />
                  </View>
                </View>
              </KeyboardAwareScrollView>
            )}
          </ScreenWithToolbar>

          <ComingSoonModal
            visible={comingSoonVisible}
            onClose={() => setComingSoonVisible(false)}
          />
        </>
      )}
    </RhfFormProvider>
  );
};

export default SlotCreate;
