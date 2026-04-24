import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { Routers } from "@/src/constants/routers";
import { parseISO } from "date-fns";
import { formatDayMonthLong } from "@/src/utils/date/formatDate";
import { RhfCalendarDatePicker } from "@/src/components/hookForm/rhf-calendar-date-picker";
import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { formatTime } from "@/src/utils/date/formatTime";
import {
  useForm,
  FormProvider,
  useFieldArray,
  Controller,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";
import {
  SlotCreateSchema,
  type SlotCreateFormValues,
} from "@/src/validation/schemas/slotCreate.schema";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Avatar,
  Button,
  Card,
  IconButton,
  Input,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { BaseField } from "@/src/components/ui/fields/BaseField";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import RHFPicker from "@/src/components/hookForm/rhf-picker";
import type { AutocompleteItem } from "@/src/components/ui/fields/Autocomplete";
import { useGetCustomersQuery } from "@/src/store/redux/services/api/customersApi";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  clearSlotDraft,
  setSlotDraft,
  clearCreatedCustomer,
} from "@/src/store/redux/slices/slotDraftSlice";
import { useCreateAppointmentMutation } from "@/src/store/redux/services/api/appointmentsApi";
import { setHighlightSlotId } from "@/src/store/redux/slices/calendarSlice";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import ComingSoonModal from "@/src/components/shared/modals/ComingSoonModal";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";

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
      duration: initialServices.reduce((sum, s) => sum + s.duration, 0) || 60,
      comment: "",
      paymentMethod: "cash",
      sendNotification: true,
    },
  });

  useFormNavigationGuard(methods.formState.isDirty);

  const { handleSubmit, watch, setValue } = methods;
  const watchedServices = watch("services");
  const paymentMethod = watch("paymentMethod");
  const [comingSoonVisible, setComingSoonVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<AutocompleteItem | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const { data: customersData } = useGetCustomersQuery(
    auth ? { userId: auth.userId } : skipToken,
  );
  const customerItems: AutocompleteItem[] = useMemo(
    () =>
      (customersData?.customers ?? []).map((c) => ({
        id: String(c.id),
        title: c.name,
      })),
    [customersData],
  );

  const filteredCustomers = useMemo(
    () =>
      customerItems.filter((c) =>
        c.title.toLowerCase().includes(customerSearch.toLowerCase()),
      ),
    [customerItems, customerSearch],
  );

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
        router.dismissAll();
        router.replace(Routers.app.calendar.root(values.date));
        methods.reset(values);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось создать запись"));
      }
    },
    [auth, draft.additionalServices, createAppointment, dispatch],
  );

  const onValidationError = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleCloseCustomerModal = useCallback(() => {
    setCustomerModalVisible(false);
    setCustomerSearch("");
  }, []);

  const handleSelectCustomer = useCallback(
    (item: AutocompleteItem) => {
      setSelectedCustomer(item);
      setValue("customerId", parseInt(item.id, 10) || 0, { shouldDirty: true });
      setCustomerModalVisible(false);
      setCustomerSearch("");
    },
    [setValue],
  );

  useEffect(() => {
    if (draft.createdCustomer) {
      const item: AutocompleteItem = {
        id: String(draft.createdCustomer.id),
        title: draft.createdCustomer.name,
      };
      setValue("customerId", parseInt(item.id, 10) || 0, { shouldDirty: true });
      setSelectedCustomer(item);
      dispatch(clearCreatedCustomer());
    }
  }, [dispatch, draft.createdCustomer, setValue]);

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать слот">
        {({ topInset, bottomInset }) => (
          <KeyboardAwareScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bottomOffset={BOTTOM_OFFSET}
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
              <Controller
                control={methods.control}
                name="customerId"
                render={({ fieldState: { error } }) => (
                  <BaseField
                    label="Клиент"
                    error={error}
                    hideErrorText
                    startAdornment={
                      <StSvg
                        name="Search"
                        size={24}
                        color={colors.neutral[900]}
                      />
                    }
                    renderControl={() => (
                      <Pressable
                        className="flex-1 justify-center"
                        onPress={() => setCustomerModalVisible(true)}
                      >
                        <Text
                          className="font-inter-regular text-[16px] px-4"
                          style={{
                            color: selectedCustomer
                              ? colors.neutral[900]
                              : colors.neutral[300],
                          }}
                        >
                          {selectedCustomer?.title ??
                            "Поиск по имени или телефону"}
                        </Text>
                      </Pressable>
                    )}
                  />
                )}
              />
              <Button
                title=" Создать нового клиента"
                variant="clear"
                onPress={() =>
                  router.push(Routers.app.calendar.slotClientCreate)
                }
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
                <RhfDatePicker
                  name="time"
                  label="Время"
                  placeholder="чч:мм"
                  formatValue={(date: Date) => formatTime(date)}
                  parseValue={(value: string) => {
                    if (!value) return null;
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
              <RHFPicker
                name="duration"
                label="Изменить продолжительность (мин)"
                placeholder="Выберите длительность"
                defaultValue={60}
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
                onPress={handleSubmit(onSubmit, onValidationError)}
                rightIcon={
                  <StSvg
                    name="Add_round_fill"
                    size={24}
                    color={colors.neutral[0]}
                  />
                }
              />
            </View>
          </KeyboardAwareScrollView>
        )}
      </ScreenWithToolbar>

      <StModal
        visible={customerModalVisible}
        onClose={handleCloseCustomerModal}
        keyboardAware
      >
        <Typography weight="semibold" className="text-display text-center mb-4">
          Выбрать клиента
        </Typography>
        <Input
          value={customerSearch}
          onChangeText={setCustomerSearch}
          placeholder="Поиск по имени или телефону"
          autoFocus
          startAdornment={
            <StSvg name="Search" size={24} color={colors.neutral[500]} />
          }
        />
        <View className="mt-2">
          {filteredCustomers.length === 0 ? (
            <Typography className="text-body text-neutral-400 text-center py-4">
              Ничего не найдено
            </Typography>
          ) : (
            filteredCustomers.map((item, index) => (
              <View key={item.id}>
                {index > 0 && <View className="h-px bg-neutral-100" />}
                <Pressable
                  className="flex-row items-center gap-3 py-3 px-2 active:opacity-70"
                  onPress={() => handleSelectCustomer(item)}
                >
                  <Avatar name={item.title} size="sm" />
                  <Typography className="text-body text-neutral-900">
                    {item.title}
                  </Typography>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </StModal>

      <ComingSoonModal
        visible={comingSoonVisible}
        onClose={() => setComingSoonVisible(false)}
      />
    </FormProvider>
  );
};

export default SlotCreate;
