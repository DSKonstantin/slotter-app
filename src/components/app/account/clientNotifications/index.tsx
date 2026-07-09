import React, { useCallback, useMemo, useState } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import {
  useGetNotificationSettingsQuery,
  useGetNotificationStatsQuery,
} from "@/src/store/redux/services/api/notificationsApi";
import {
  Badge,
  Button,
  Card,
  Divider,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { SlotterLogo } from "@/src/components/shared/svg/SlotterLogo";
import { MaxLogo } from "@/src/components/shared/svg/MaxLogo";
import DirectDiffModal from "./DirectDiffModal";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { asArray } from "@/src/utils/asArray";

const FILTER_PERIODS = ["Сегодня", "Неделя", "Месяц"] as const;

const DATE_FORMAT = "yyyy-MM-dd";

function getPeriodRange(periodIndex: number): { from: string; to: string } {
  const now = new Date();
  if (periodIndex === 0) {
    return {
      from: format(startOfDay(now), DATE_FORMAT),
      to: format(endOfDay(now), DATE_FORMAT),
    };
  }
  if (periodIndex === 1) {
    return {
      from: format(startOfWeek(now, { weekStartsOn: 1 }), DATE_FORMAT),
      to: format(endOfWeek(now, { weekStartsOn: 1 }), DATE_FORMAT),
    };
  }
  return {
    from: format(startOfMonth(now), DATE_FORMAT),
    to: format(endOfMonth(now), DATE_FORMAT),
  };
}

const APP_FEATURES = [
  {
    icon: "Refresh_2_light" as const,
    text: "Клиент сам записывается повторно",
  },
  { icon: "close_ring_light" as const, text: "Переносит и отменяет запись" },
  {
    icon: "Chat_alt_3_light" as const,
    text: "Оставляет отзыв прямо в приложении",
  },
  { icon: "Chat_light" as const, text: "Пишет в чат без лишних мессенджеров" },
];

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

const DIRECT_CHANNELS = [
  {
    channel: "telegram" as const,
    icon: "SocialTelegram" as const,
    iconColor: "#37B5DB",
    name: "Telegram",
    price: "от 1 000 ₽/мес",
  },
  {
    channel: "max" as const,
    icon: null,
    iconNode: <MaxLogo size={28} />,
    iconColor: "#7B61FF",
    name: "Макс",
    price: "от 1 000 ₽/мес",
  },
];

const ClientNotifications = () => {
  const [activePeriod, setActivePeriod] = useState(0);
  const [diffModalVisible, setDiffModalVisible] = useState(false);
  const auth = useRequiredAuth();

  const { data: settingsData, refetch: refetchSettings } =
    useGetNotificationSettingsQuery(auth ? auth.userId : skipToken);

  const periodRange = useMemo(
    () => getPeriodRange(activePeriod),
    [activePeriod],
  );

  const {
    data: statsData,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
  } = useGetNotificationStatsQuery(
    auth ? { userId: auth.userId, ...periodRange } : skipToken,
    { refetchOnMountOrArgChange: true },
  );

  const { refreshing, onRefresh } = useRefresh(
    useCallback(async () => {
      await Promise.all([refetchSettings(), refetchStats()]);
    }, [refetchSettings, refetchStats]),
  );

  const notificationSettingsSummary = useMemo(() => {
    const all = asArray(settingsData?.customer).flatMap((group) =>
      asArray(group.items),
    );
    const enabled = all.filter((s) => s.enabled).length;
    return { enabled, total: all.length };
  }, [settingsData]);

  const stats = useMemo(() => {
    const t = statsData?.notification_stats.totals;
    return [
      {
        value: String(t?.sent ?? 0),
        label: "Отправлено",
        color: "text-primary-blue-500",
      },
      {
        value: String((t?.sent ?? 0) - (t?.failed ?? 0)),
        label: "Доставлено",
        color: "text-green-700",
      },
      {
        value: String(t?.failed ?? 0),
        label: "Ошибки",
        color: "text-accent-red-500",
      },
    ];
  }, [statsData]);

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
            <View className="flex-row justify-between items-center mb-2">
              <Typography weight="semibold" className="text-body">
                Статистика
              </Typography>
              <Button
                title="Подробнее"
                size="xs"
                buttonClassName="gap-0"
                textClassName="text-neutral-500 text-[13px]"
                variant="clear"
                onPress={() =>
                  router.push(
                    Routers.app.account.clientNotifications.statistics,
                  )
                }
                rightIcon={
                  <StSvg
                    name="Expand_right"
                    size={16}
                    color={colors.neutral[500]}
                  />
                }
              />
            </View>

            <View className="bg-background-surface p-4 rounded-base gap-5">
              <View className="flex-row flex-wrap gap-2">
                {FILTER_PERIODS.map((period, i) => (
                  <Badge
                    key={period}
                    title={period}
                    variant={i === activePeriod ? "accent" : "ghost"}
                    onPress={() => setActivePeriod(i)}
                  />
                ))}
              </View>

              {isStatsLoading ? (
                <View className="h-[52px] items-center justify-center">
                  <ActivityIndicator color={colors.neutral[400]} />
                </View>
              ) : isStatsError ? (
                <RetryInline
                  text="Не удалось загрузить статистику"
                  onRetry={refetchStats}
                  layout="column"
                />
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {stats.map(({ value, label, color }) => (
                    <View key={label} className="flex-1">
                      <Typography
                        weight="semibold"
                        className={`text-display ${color}`}
                      >
                        {value}
                      </Typography>
                      <Typography
                        weight="regular"
                        className="text-neutral-500 text-caption"
                      >
                        {label}
                      </Typography>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <Typography className="text-caption text-neutral-500 mt-5 mb-2">
              Бесплатные каналы
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

              <View className="mb-2.5 gap-2">
                {APP_FEATURES.map(({ icon, text }) => (
                  <View key={text} className="flex-row gap-2 items-center">
                    <StSvg name={icon} size={20} color={colors.neutral[900]} />
                    <Typography weight="regular" className="text-caption">
                      {text}
                    </Typography>
                  </View>
                ))}
              </View>

              <Button
                title="Поделиться приложением"
                onPress={() => {}}
                disabled
                variant="accent"
                rightIcon={
                  <StSvg name="link_alt" size={24} color={colors.neutral[0]} />
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

            <Typography className="text-caption text-neutral-500 mt-5 mb-2">
              Настройки
            </Typography>

            <Card
              title="Виды уведомлений"
              subtitle={
                notificationSettingsSummary.total > 0
                  ? `Включено: ${notificationSettingsSummary.enabled} / ${notificationSettingsSummary.total}`
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
                  color={colors.neutral[900]}
                />
              }
            />
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
