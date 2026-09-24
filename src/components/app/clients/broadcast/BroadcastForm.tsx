import React, { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import debounce from "lodash/debounce";
import {
  FormProvider,
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Button,
  Divider,
  FloatingFooter,
  Item,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { RHFSelect } from "@/src/components/hookForm/rhf-select";
import { RhfCalendarDatePicker } from "@/src/components/hookForm/rhf-calendar-date-picker";
import { RhfTimeWheelField } from "@/src/components/hookForm/rhf-time-wheel-field";
import { colors } from "@/src/styles/colors";
import { FULL_DAY_MINUTE_OPTIONS } from "@/src/utils/date/timeOptions";
import {
  combineDateAndMinutesToIso,
  formatDayMonth,
  formatMinutes,
} from "@/src/utils/date/formatTime";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import { useClientNotificationsConnected } from "@/src/hooks/useClientNotificationsConnected";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useOpenPersonalAccount } from "@/src/hooks/useOpenPersonalAccount";
import { useAppSelector } from "@/src/store/redux/store";
import { useDirectChannelErrorGate } from "@/src/components/app/account/clientNotifications/templates/useDirectChannelErrorGate";
import { getApiErrorMessage } from "@/src/utils/apiError";
import {
  useCreateMarketingBroadcastMutation,
  useGetMarketingBroadcastAudienceMutation,
} from "@/src/store/redux/services/api/marketingBroadcastsApi";
import type { DirectChannelKind } from "@/src/store/redux/services/api-types";
import {
  broadcastCreateSchema,
  type BroadcastCreateFormValues,
} from "@/src/validation/schemas/broadcastCreate.schema";
import { EMPTY_AUDIENCE_FILTERS } from "./audienceFilter/types";
import { mapAudienceFilters } from "./mapAudienceFilters";
import { AudienceFilterModal } from "./audienceFilter/AudienceFilterModal";
import { summarizeAudienceFilters } from "./audienceFilter/summary";
import ConnectChannelModal from "./ConnectChannelModal";

const CHANNEL_KIND_BY_VALUE: Record<string, DirectChannelKind> = {
  telegram: "telegram_direct",
  max: "max_direct",
};

const AUDIENCE_DEBOUNCE_MS = 400;

const randomUUID = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const FIELD_ERROR_MAP: Record<string, keyof BroadcastCreateFormValues> = {
  name: "name",
  body: "message",
  channel_kind: "channel",
  scheduled_at: "scheduledDate",
};

const SectionLabel = ({ children }: { children: string }) => (
  <Typography className="text-caption text-neutral-500 mb-2">
    {children}
  </Typography>
);

const Hint = ({ children }: { children: string }) => (
  <Typography className="text-caption text-neutral-500 mt-2 mb-5">
    {children}
  </Typography>
);

const BroadcastForm = () => {
  const [footerHeight, setFooterHeight] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [recipientsCount, setRecipientsCount] = useState(0);

  const idempotencyKeyRef = useRef(randomUUID());

  const insets = useSafeAreaInsets();
  const auth = useRequiredAuth();
  const openPersonalAccount = useOpenPersonalAccount();
  const ispe = useAppSelector((state) => state.appVersion.ispe);
  const { channels, connected } = useClientNotificationsConnected();
  const {
    channelModalVisible,
    setChannelModalVisible,
    guardDirectChannelError,
  } = useDirectChannelErrorGate();

  const [createBroadcast, { isLoading: isCreating }] =
    useCreateMarketingBroadcastMutation();
  const [getAudience] = useGetMarketingBroadcastAudienceMutation();

  const methods = useForm<BroadcastCreateFormValues>({
    resolver: yupResolver(
      broadcastCreateSchema,
    ) as Resolver<BroadcastCreateFormValues>,
    defaultValues: {
      name: "",
      message: "",
      onlyConsented: true,
      isScheduled: false,
      scheduledDate: null,
      scheduledTime: undefined,
      channel: "",
      audienceFilters: {},
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { isDirty, isValid },
  } = methods;

  useFormNavigationGuard(isDirty);

  const isScheduled = useWatch({ control, name: "isScheduled" });
  const audienceFilters = useWatch({ control, name: "audienceFilters" });
  const onlyConsented = useWatch({ control, name: "onlyConsented" });

  const channelOptions = useMemo(
    () => [
      {
        label: "Telegram Direct",
        value: "telegram",
        disabled: !channels.telegram,
      },
      { label: "Макс Direct", value: "max", disabled: !channels.max },
    ],
    [channels.telegram, channels.max],
  );

  const audienceSummary = summarizeAudienceFilters(audienceFilters);

  const fetchAudience = useRef(
    debounce((filtersArg: unknown, consentArg: boolean) => {
      if (!auth) return;
      getAudience({
        userId: auth.userId,
        body: {
          is_marketing_consent_required: consentArg,
          audience_filters: mapAudienceFilters(filtersArg as never),
        },
      })
        .unwrap()
        .then((res) => setRecipientsCount(res.audience.recipients_count))
        .catch(() => {});
    }, AUDIENCE_DEBOUNCE_MS),
  ).current;

  useEffect(() => {
    fetchAudience(audienceFilters, onlyConsented);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceFilters, onlyConsented]);

  useEffect(() => () => fetchAudience.cancel(), [fetchAudience]);

  const onSubmit = (data: BroadcastCreateFormValues) => {
    if (!auth) return;

    createBroadcast({
      userId: auth.userId,
      idempotencyKey: idempotencyKeyRef.current,
      body: {
        name: data.name,
        body: data.message,
        channel_kind: CHANNEL_KIND_BY_VALUE[data.channel],
        scheduled_at:
          data.isScheduled && data.scheduledDate && data.scheduledTime != null
            ? combineDateAndMinutesToIso(data.scheduledDate, data.scheduledTime)
            : undefined,
        is_marketing_consent_required: data.onlyConsented,
        audience_filters: mapAudienceFilters(data.audienceFilters),
      },
    })
      .unwrap()
      .then(() => {
        toast.success(
          data.isScheduled ? "Рассылка запланирована" : "Рассылка запущена",
        );
        reset(data);
        setTimeout(() => router.back(), 0);
      })
      .catch((e: unknown) => {
        guardDirectChannelError(e, (err) => {
          const errors = (
            err as { data?: { errors?: Record<string, string[]> } }
          )?.data?.errors;
          if (errors) {
            let handled = false;
            Object.entries(errors).forEach(([field, messages]) => {
              const formField = FIELD_ERROR_MAP[field];
              if (formField && messages[0]) {
                setError(formField, { message: messages[0] });
                handled = true;
              }
            });
            if (handled) return;
          }
          toast.error(getApiErrorMessage(err, "Не удалось создать рассылку"));
        });
      });
  };

  const submitTitle = isScheduled
    ? "Запланировать рассылку"
    : "Запустить рассылку";

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать рассылку">
        {({ topInset }) => (
          <>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              bottomOffset={16}
              contentContainerStyle={{
                paddingTop: topInset,
                paddingBottom: footerHeight + 16,
              }}
            >
              <View className="px-screen">
                <View className="mb-5">
                  <RhfTextField
                    name="name"
                    label="Название рассылки"
                    placeholder="Укажите название"
                    hideErrorText
                  />
                </View>

                <View className="mb-5">
                  <RhfTextField
                    name="message"
                    label="Текст сообщения"
                    placeholder="Ваше сообщение"
                    multiline
                    numberOfLines={4}
                    hideErrorText
                  />
                </View>

                <SectionLabel>Аудитория</SectionLabel>
                <Item
                  title="Получатели"
                  className="rounded-base"
                  onPress={() => setFilterOpen(true)}
                  right={
                    <View className="flex-row items-center gap-1">
                      <Typography className="text-body text-neutral-500">
                        {audienceSummary}
                      </Typography>
                      <StSvg
                        name="Expand_right_light"
                        size={24}
                        color={colors.neutral[300]}
                      />
                    </View>
                  }
                />
                <Hint>
                  Для адресной рассылки вы можете использовать несколько
                  фильтров одновременно
                </Hint>

                <Item
                  title="Не отправлять клиентам без полученного согласия"
                  className="rounded-base"
                  right={<RHFSwitch name="onlyConsented" />}
                />
                <Hint>
                  При включении данного фильтра рассылка будет направлена только
                  клиентам, которые дали своё согласие
                </Hint>

                <SectionLabel>Начало рассылки</SectionLabel>
                <View className="bg-background-surface rounded-base p-4">
                  <Item
                    title="Отложенная рассылка"
                    className="rounded-base border-0 p-0 min-h-0"
                    right={<RHFSwitch name="isScheduled" />}
                  />
                  {isScheduled && (
                    <>
                      <Divider className="my-4" />

                      <View className="flex-row gap-2">
                        <View className="flex-1">
                          <RhfCalendarDatePicker
                            name="scheduledDate"
                            label="Дата"
                            placeholder="дд.мм"
                            displayFormat={formatDayMonth}
                            hideErrorText
                            endAdornment={
                              <StSvg
                                name="Expand_down"
                                size={24}
                                color={colors.neutral[500]}
                              />
                            }
                            fieldClassName="bg-background-card"
                          />
                        </View>
                        <View className="flex-1">
                          <RhfTimeWheelField
                            name="scheduledTime"
                            label="Время"
                            title="Время отложенной рассылки"
                            placeholder="00:00"
                            hideErrorText
                            endAdornment={
                              <StSvg
                                name="Expand_down"
                                size={24}
                                color={colors.neutral[500]}
                              />
                            }
                            options={FULL_DAY_MINUTE_OPTIONS}
                            loop
                            formatDisplay={formatMinutes}
                            fieldClassName="bg-background-card"
                          />
                        </View>
                      </View>
                    </>
                  )}
                </View>

                <Hint>
                  Рассылка запустится автоматически в назначенное время
                </Hint>

                <SectionLabel>Канал отправки</SectionLabel>
                <RHFSelect
                  name="channel"
                  label="Канал отправки"
                  placeholder="Выберите канал"
                  items={channelOptions}
                  inline
                />
                <Hint>
                  Рассылка отправляется постепенно, по правилам мессенджеров
                </Hint>
              </View>
            </KeyboardAwareScrollView>

            <FloatingFooter
              offset={0}
              horizontalPadding={0}
              onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
            >
              <View
                className="bg-background rounded-t-large overflow-hidden px-screen pt-4"
                style={{ boxShadow: "0px -4px 12px rgba(0, 0, 0, 0.08)" }}
              >
                <View className="flex-row items-center">
                  <Typography className="text-body text-neutral-500 flex-1">
                    Получателей:
                  </Typography>
                  <Typography
                    weight="regular"
                    className="text-body text-neutral-900"
                  >
                    {recipientsCount}
                  </Typography>
                  <StSvg name="Users" size={20} color={colors.neutral[900]} />
                </View>
                <View
                  className="mt-5"
                  style={{ paddingBottom: insets.bottom + 8 }}
                >
                  <Button
                    title={submitTitle}
                    variant="accent"
                    disabled={isCreating || (connected && !isValid)}
                    onPress={() => {
                      if (!connected) {
                        setChannelModalVisible(true);
                        return;
                      }
                      handleSubmit(onSubmit)();
                    }}
                  />
                </View>
              </View>
            </FloatingFooter>

            <AudienceFilterModal
              visible={filterOpen}
              value={audienceFilters ?? EMPTY_AUDIENCE_FILTERS}
              onClose={() => setFilterOpen(false)}
              onApply={(filters) =>
                setValue("audienceFilters", filters, { shouldDirty: true })
              }
            />

            <ConnectChannelModal
              visible={channelModalVisible}
              onClose={() => setChannelModalVisible(false)}
              onConnect={
                ispe
                  ? () => openPersonalAccount("/go/notifications")
                  : undefined
              }
            />
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default BroadcastForm;
