import React, { useMemo, useState } from "react";
import { View } from "react-native";
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
import { RhfDateRangeField } from "@/src/components/hookForm/rhf-date-range-field";
import { RhfTimeWheelField } from "@/src/components/hookForm/rhf-time-wheel-field";
import { colors } from "@/src/styles/colors";
import { FULL_DAY_MINUTE_OPTIONS } from "@/src/utils/date/timeOptions";
import { formatMinutes } from "@/src/utils/date/formatTime";
import { formatShortDateRange } from "@/src/utils/date/formatDate";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import { useClientNotificationsConnected } from "@/src/hooks/useClientNotificationsConnected";
import {
  broadcastCreateSchema,
  type BroadcastCreateFormValues,
} from "@/src/validation/schemas/broadcastCreate.schema";
import { EMPTY_AUDIENCE_FILTERS, getBroadcastById } from "./broadcastMock";
import { AudienceFilterModal } from "./audienceFilter/AudienceFilterModal";
import { summarizeAudienceFilters } from "./audienceFilter/summary";

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

type Props = {
  broadcastId?: string;
};

const BroadcastForm = ({ broadcastId }: Props) => {
  const [footerHeight, setFooterHeight] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const insets = useSafeAreaInsets();
  const { channels } = useClientNotificationsConnected();

  const editing = broadcastId != null;
  const existing = getBroadcastById(broadcastId);

  const methods = useForm<BroadcastCreateFormValues>({
    resolver: yupResolver(
      broadcastCreateSchema,
    ) as Resolver<BroadcastCreateFormValues>,
    defaultValues: {
      name: existing?.form.name ?? "",
      message: existing?.form.message ?? "",
      onlyConsented: existing?.form.onlyConsented ?? true,
      isScheduled: existing?.form.isScheduled ?? false,
      scheduledDate: existing?.form.scheduledDate ?? null,
      scheduledTime: existing?.form.scheduledTime,
      channel: existing?.form.channel ?? "",
      audienceFilters: existing?.form.audienceFilters ?? {},
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isDirty, isValid },
  } = methods;

  useFormNavigationGuard(isDirty);

  const isScheduled = useWatch({ control, name: "isScheduled" });
  const audienceFilters = useWatch({ control, name: "audienceFilters" });

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

  const onSubmit = (data: BroadcastCreateFormValues) => {
    void data;
    toast.success(
      editing
        ? "Изменения сохранены"
        : data.isScheduled
          ? "Рассылка запланирована"
          : "Рассылка запущена",
    );
    router.back();
  };

  const submitTitle = editing
    ? "Сохранить"
    : isScheduled
      ? "Запланировать рассылку"
      : "Запустить рассылку";

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar
        title={editing ? "Редактировать рассылку" : "Создать рассылку"}
      >
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
                          <RhfDateRangeField
                            name="scheduledDate"
                            label="Дата"
                            title="Дата отложенной рассылки"
                            placeholder="дд.мм – дд.мм"
                            formatDisplay={formatShortDateRange}
                            fieldClassName="bg-background-card"
                            hideErrorText
                            endAdornment={
                              <StSvg
                                name="Expand_down"
                                size={24}
                                color={colors.neutral[500]}
                              />
                            }
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
                    0
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
                    disabled={!isValid}
                    onPress={handleSubmit(onSubmit)}
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
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default BroadcastForm;
