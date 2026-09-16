import React, { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import RetryInline from "@/src/components/shared/retryInline";
import DirectChannelsSkeleton from "./DirectChannelsSkeleton";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { useRefetchOnForeground } from "@/src/hooks/useRefetchOnForeground";
import { useOpenPersonalAccount } from "@/src/hooks/useOpenPersonalAccount";
import { safeRefetch } from "@/src/utils/safeRefetch";
import { useGetNotificationSettingsQuery } from "@/src/store/redux/services/api/notificationsApi";
import { useGetNotificationTemplatesQuery } from "@/src/store/redux/services/api/notificationTemplatesApi";
import {
  useGetSubscriptionDirectPlansQuery,
  useGetSubscriptionDirectChannelsQuery,
} from "@/src/store/redux/services/api/subscriptionDirectApi";
import type {
  DirectChannelKind,
  NotificationKind,
} from "@/src/store/redux/services/api-types";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { getDirectChannelRowStatus } from "./directChannelRowStatus";
import { Button, Card, Divider, StSvg, Typography } from "@/src/components/ui";
import { SlotterLogo } from "@/src/components/shared/svg/SlotterLogo";
import { MaxLogo } from "@/src/components/shared/svg/MaxLogo";
import ClientsHeaderCard from "@/src/components/app/clients/clientsList/ClientsHeaderCard";
import BroadcastEntryCard from "@/src/components/app/clients/clientsList/BroadcastEntryCard";
import DirectDiffModal from "./DirectDiffModal";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { asArray } from "@/src/utils/asArray";
import { useAppSelector } from "@/src/store/redux/store";

const APP_FEATURES = [
  {
    icon: "Refresh_2_light" as const,
    text: "Повторная запись",
  },
  { icon: "close_ring_light" as const, text: "Перенос и отмена" },
  {
    icon: "Chat_alt_3_light" as const,
    text: "Отзывы в приложении",
  },
  { icon: "Chat_light" as const, text: "Встроенный чат" },
];

const CLIENT_APP_STORE_URL =
  "https://apps.apple.com/ru/app/slotter-%D1%82%D1%80%D0%B5%D0%BA%D0%B5%D1%80-%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B5%D0%B9/id6784702976";
const CLIENT_PLAY_STORE_URL: string | null = null;

const CLIENT_APP_SHARE_URL = Platform.select({
  ios: CLIENT_APP_STORE_URL,
  android: CLIENT_PLAY_STORE_URL,
});

const TELEGRAM_BOTS = [
  {
    title: "Telegram Bot",
    icon: <StSvg name="SocialTelegram" size={24} color="#37B5DB" />,
    url: "https://t.me/slotter_robot",
  },
  {
    title: "Макс Bot",
    icon: <MaxLogo size={24} />,
    url: "https://max.ru/id6163237617_1_bot",
  },
];

const DIRECT_CHANNEL_UI_CONFIG: Record<
  "telegram" | "max",
  {
    kind: DirectChannelKind;
    icon: "SocialTelegram" | null;
    iconNode?: React.ReactNode;
    iconColor: string;
    name: string;
  }
> = {
  telegram: {
    kind: "telegram_direct",
    icon: "SocialTelegram",
    iconColor: "#37B5DB",
    name: "Telegram",
  },
  max: {
    kind: "max_direct",
    icon: null,
    iconNode: <MaxLogo size={28} />,
    iconColor: "#7B61FF",
    name: "Макс",
  },
};

const INACTIVE_DIRECT_CHANNEL_STATUSES = new Set(["cancelled", "expired"]);

const ClientNotifications = () => {
  const [diffModalVisible, setDiffModalVisible] = useState(false);

  const ispe = useAppSelector((state) => state.appVersion.ispe);
  const auth = useRequiredAuth();
  const openPersonalAccount = useOpenPersonalAccount();

  const { data: templatesData, refetch: refetchTemplates } =
    useGetNotificationTemplatesQuery(auth ? auth.userId : skipToken);

  const { data: settingsData, refetch: refetchSettings } =
    useGetNotificationSettingsQuery(auth ? auth.userId : skipToken);

  const {
    data: directPlansData,
    isLoading: isDirectPlansLoading,
    isFetching: isDirectPlansFetching,
    isError: isDirectPlansError,
    refetch: refetchDirectPlans,
  } = useGetSubscriptionDirectPlansQuery(undefined, { skip: !ispe });

  const {
    data: directChannelsData,
    isLoading: isDirectChannelsLoading,
    isFetching: isDirectChannelsFetching,
    isError: isDirectChannelsError,
    refetch: refetchDirectChannels,
  } = useGetSubscriptionDirectChannelsQuery(
    auth && ispe ? { userId: auth.userId } : skipToken,
  );

  useRefetchOnForeground(refetchDirectChannels);

  const isDirectLoading = isDirectPlansLoading || isDirectChannelsLoading;
  const isDirectError = isDirectPlansError || isDirectChannelsError;
  const isDirectFetching = isDirectPlansFetching || isDirectChannelsFetching;

  const notificationTemplatesSummary = useMemo(() => {
    const rows = asArray(templatesData?.notification_templates);
    const templateKinds = new Set<NotificationKind>(rows.map((r) => r.kind));
    const otherItems = asArray(settingsData?.customer)
      .flatMap((group) => asArray(group.items))
      .filter((item) => !templateKinds.has(item.kind));

    const enabled =
      rows.filter((r) => r.enabled).length +
      otherItems.filter((item) => item.enabled).length;
    return { enabled, total: rows.length + otherItems.length };
  }, [templatesData, settingsData]);

  const directChannelRows = useMemo(() => {
    const activePlans = asArray(directPlansData).filter((p) => p.is_active);
    const existingChannels = asArray(
      directChannelsData?.subscription_direct_channels,
    );

    return (["telegram", "max"] as const).map((channel) => {
      const config = DIRECT_CHANNEL_UI_CONFIG[channel];
      const plan = activePlans.find((p) => p.kind === config.kind);
      const existing = existingChannels.find(
        (c) =>
          c.kind === config.kind &&
          !INACTIVE_DIRECT_CHANNEL_STATUSES.has(c.status),
      );

      return { channel, config, plan, existing };
    });
  }, [directPlansData, directChannelsData]);

  const handleRetryDirect = useCallback(() => {
    refetchDirectPlans();
    refetchDirectChannels();
  }, [refetchDirectPlans, refetchDirectChannels]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      safeRefetch(refetchTemplates),
      safeRefetch(refetchSettings),
      safeRefetch(refetchDirectPlans),
      safeRefetch(refetchDirectChannels),
    ]);
  }, [
    refetchTemplates,
    refetchSettings,
    refetchDirectPlans,
    refetchDirectChannels,
  ]);

  const { refreshing, onRefresh } = useRefresh(refetchAll);

  const handleBotPress = (url: string) => {
    Alert.alert("Отправьте клиенту ссылку бот", url, [
      {
        text: "Скопировать",
        onPress: async () => {
          await Clipboard.setStringAsync(url);
          toast.success("Ссылка скопирована");
        },
      },
      { text: "Поделиться", onPress: () => Share.share({ message: url }) },
      { text: "Отмена", style: "cancel" },
    ]);
  };

  return (
    <>
      <ScreenWithToolbar title="Уведомления клиентам">
        {({ topInset, bottomInset }) => (
          <ScrollView
            className="px-screen"
            showsVerticalScrollIndicator={false}
            contentInset={Platform.OS === "ios" ? { top: topInset } : undefined}
            contentOffset={
              Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
            }
            contentContainerStyle={{
              paddingTop: Platform.OS === "ios" ? 0 : topInset,
              paddingBottom: bottomInset + 8,
            }}
            refreshControl={
              <RefreshControl
                progressViewOffset={Platform.select({ android: topInset })}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            <View className="flex-row gap-2.5 mb-2">
              <ClientsHeaderCard
                iconName="Pipe_fill"
                label="Статистика"
                onPress={() =>
                  router.push(
                    Routers.app.account.clientNotifications.statistics,
                  )
                }
              />
              <BroadcastEntryCard />
            </View>

            <Card
              title="Виды уведомлений"
              subtitle={
                notificationTemplatesSummary.total > 0
                  ? `Активно: ${notificationTemplatesSummary.enabled} / ${notificationTemplatesSummary.total}`
                  : undefined
              }
              subtitleProps={{
                style: {
                  color: colors.primary.green[600],
                },
              }}
              onPress={() =>
                router.push(Routers.app.account.clientNotifications.types)
              }
              right={
                <StSvg
                  name="Expand_right_light"
                  size={24}
                  color={colors.neutral[500]}
                />
              }
            />

            {ispe && (
              <>
                <View className="mt-5 flex-row gap-2 justify-between">
                  <Typography className="text-caption text-neutral-500 shrink-0">
                    Прямые уведомления
                  </Typography>
                  <Pressable
                    onPress={() => setDiffModalVisible(true)}
                    className="flex-row items-center gap-1 shrink active:opacity-70"
                  >
                    <StSvg
                      name="Info_alt_fill"
                      size={16}
                      color={colors.primary.blue[500]}
                    />
                    <Typography
                      numberOfLines={1}
                      className="text-caption text-primary-blue-500 shrink"
                    >
                      В чем преимущество?
                    </Typography>
                  </Pressable>
                </View>

                <View className="bg-background-surface p-4 rounded-base mt-2">
                  {isDirectLoading ? (
                    <DirectChannelsSkeleton />
                  ) : isDirectError ? (
                    <RetryInline
                      text="Не удалось загрузить каналы"
                      onRetry={handleRetryDirect}
                      isLoading={isDirectFetching}
                      layout="column"
                      className="py-2"
                    />
                  ) : (
                    directChannelRows.map(
                      ({ channel, config, plan, existing }, i) => {
                        const status = getDirectChannelRowStatus(
                          existing,
                          config.kind,
                        );
                        return (
                          <React.Fragment key={channel}>
                            <Card
                              className="p-0"
                              titleNode={
                                <View className="flex-row items-center gap-1.5">
                                  {config.iconNode ?? (
                                    <StSvg
                                      name={config.icon!}
                                      size={28}
                                      color={config.iconColor}
                                    />
                                  )}
                                  <Typography className="text-body">
                                    {config.name}
                                  </Typography>
                                </View>
                              }
                              subtitle={
                                existing
                                  ? existing.period_ends_at
                                    ? `Оплачен до ${format(new Date(existing.period_ends_at), "dd.MM.yy")}`
                                    : `${formatRublesFromCents(existing.price_cents)}/мес`
                                  : plan
                                    ? `${formatRublesFromCents(plan.price_cents)}/мес`
                                    : undefined
                              }
                              subtitleProps={
                                existing?.period_ends_at
                                  ? {
                                      style: {
                                        color: colors.primary.green[400],
                                      },
                                    }
                                  : undefined
                              }
                              right={
                                <View className="flex-row items-center gap-1">
                                  <Typography
                                    className={
                                      status.emphasized
                                        ? "text-[13px] font-inter-semibold"
                                        : "text-caption"
                                    }
                                    style={{ color: status.color }}
                                  >
                                    {status.label}
                                  </Typography>
                                  <StSvg
                                    name={status.iconName}
                                    size={16}
                                    color={status.color}
                                  />
                                </View>
                              }
                              onPress={() =>
                                openPersonalAccount(status.webPath)
                              }
                            />
                            {i < directChannelRows.length - 1 && (
                              <Divider className="my-4" />
                            )}
                          </React.Fragment>
                        );
                      },
                    )
                  )}
                </View>
              </>
            )}

            <Typography className="text-caption text-neutral-500 mt-5 mb-2">
              Бесплатные каналы уведомлений
            </Typography>

            <View className="bg-background-surface p-4 rounded-base">
              <View className="flex-row gap-2 items-center">
                <SlotterLogo size={32} />
                <View>
                  <Typography className="text-body">
                    Slotter - трекер услуг и мастеров
                  </Typography>
                  <Typography
                    weight="regular"
                    className="text-caption text-neutral-500"
                  >
                    Приложение для клиентов
                  </Typography>
                </View>
              </View>

              <Divider className="my-4" />

              <View className="mb-3 gap-2">
                <View className="flex-row gap-2">
                  {APP_FEATURES.slice(0, 2).map(({ icon, text }) => (
                    <View
                      key={text}
                      className="flex-1 flex-row gap-1 items-center"
                    >
                      <StSvg
                        name={icon}
                        size={20}
                        color={colors.neutral[900]}
                      />
                      <Typography weight="regular" className="text-caption">
                        {text}
                      </Typography>
                    </View>
                  ))}
                </View>
                <View className="flex-row gap-2">
                  {APP_FEATURES.slice(2, 4).map(({ icon, text }) => (
                    <View
                      key={text}
                      className="flex-1 flex-row gap-1 items-center"
                    >
                      <StSvg
                        name={icon}
                        size={20}
                        color={colors.neutral[900]}
                      />
                      <Typography weight="regular" className="text-caption">
                        {text}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>

              <Button
                title="Поделиться приложением"
                onPress={() => Share.share({ message: CLIENT_APP_SHARE_URL! })}
                disabled={!CLIENT_APP_SHARE_URL}
                variant="accent"
                buttonClassName="bg-background"
                textClassName="text-primary-blue-500"
                rightIcon={
                  <StSvg
                    name="link_alt"
                    size={24}
                    color={colors.primary.blue[500]}
                  />
                }
              />
            </View>

            <View className="my-2 flex-row gap-2">
              {TELEGRAM_BOTS.map(({ title, icon, url }) => (
                <Card
                  key={title}
                  title={title}
                  left={icon}
                  onPress={() => handleBotPress(url)}
                  className="flex-1"
                  right={
                    <StSvg
                      name="Expand_right_light"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                />
              ))}
            </View>

            <Typography
              weight="regular"
              className="text-caption text-neutral-500"
            >
              Клиент получит уведомление, если подписался на бота или установил
              приложение
            </Typography>
          </ScrollView>
        )}
      </ScreenWithToolbar>

      <DirectDiffModal
        visible={diffModalVisible}
        onClose={() => setDiffModalVisible(false)}
      />
    </>
  );
};

export default ClientNotifications;
