import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { Badge, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { useGetNotificationStatsQuery } from "@/src/store/redux/services/api/notificationsApi";

const FILTER_PERIODS = ["Неделя", "Месяц"] as const;
const DATE_FORMAT = "yyyy-MM-dd";

function getPeriodRange(periodIndex: number): { from: string; to: string } {
  const now = new Date();
  if (periodIndex === 0) {
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

const NotificationsStatistics = () => {
  const [activePeriod, setActivePeriod] = useState(0);
  const auth = useRequiredAuth();

  const periodRange = useMemo(
    () => getPeriodRange(activePeriod),
    [activePeriod],
  );

  const {
    data: statsData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetNotificationStatsQuery(
    auth ? { userId: auth.userId, ...periodRange } : skipToken,
    { refetchOnMountOrArgChange: true },
  );

  const { refreshing, onRefresh } = useRefresh(refetch);

  const totals = statsData?.notification_stats.totals;
  const sent = totals?.sent ?? 0;
  const delivered = (totals?.sent ?? 0) - (totals?.failed ?? 0);
  const failed = totals?.failed ?? 0;
  const deliverability =
    sent > 0 ? `${Math.round(((sent - failed) / sent) * 100)}%` : "—";

  const stats = [
    {
      value: String(sent),
      label: "Отправлено",
      color: "text-primary-blue-500",
    },
    {
      value: String(delivered),
      label: "Доставлено",
      color: "text-primary-green-600",
    },
    { value: String(failed), label: "Ошибки", color: "text-accent-red-500" },
    {
      value: deliverability,
      label: "Доставляемость",
      color: "text-purple-500",
    },
  ];

  const byChannel = statsData?.notification_stats.by_channel ?? [];
  const maxSent = Math.max(...byChannel.map((c) => c.sent), 1);

  const CHANNEL_COLORS: Record<string, string> = {
    push: colors.primary.blue[500],
    gonec: colors.accent.purple[500],
  };

  const CHANNEL_LABELS: Record<string, string> = {
    push: "Push-уведомления",
    gonec: "Мессенджеры",
  };

  return (
    <ScreenWithToolbar title="Статистика">
      {({ topInset, bottomInset }) => {
        if (isLoading) {
          return (
            <View
              className="flex-1 items-center justify-center"
              style={{ marginTop: topInset }}
            >
              <ActivityIndicator />
            </View>
          );
        }

        if (isError && !statsData) {
          return (
            <ErrorScreen
              title="Не удалось загрузить статистику"
              isLoading={isFetching}
              onRetry={refetch}
            />
          );
        }

        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentInset={Platform.OS === "ios" ? { top: topInset } : undefined}
            contentOffset={
              Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
            }
            contentContainerStyle={{
              paddingTop: Platform.OS === "ios" ? 0 : topInset,
              paddingBottom: bottomInset + 8,
            }}
            className="px-screen"
            refreshControl={
              <RefreshControl
                progressViewOffset={Platform.select({ android: topInset })}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            <View className="flex-row gap-2 mb-5">
              {FILTER_PERIODS.map((period, i) => (
                <Badge
                  key={period}
                  title={period}
                  variant={i === activePeriod ? "accent" : "ghost"}
                  onPress={() => setActivePeriod(i)}
                />
              ))}
            </View>

            <View className="flex-row gap-2 mb-2">
              {stats.slice(0, 2).map(({ value, label, color }) => (
                <View
                  key={label}
                  className="flex-1 bg-background-surface p-4 rounded-base"
                >
                  <Typography
                    weight="semibold"
                    className={`text-display ${color}`}
                  >
                    {value}
                  </Typography>
                  <Typography
                    weight="regular"
                    className="text-caption text-neutral-500"
                  >
                    {label}
                  </Typography>
                </View>
              ))}
            </View>

            <View className="flex-row gap-3 mb-5">
              {stats.slice(2).map(({ value, label, color }) => (
                <View
                  key={label}
                  className="flex-1 bg-background-surface p-4 rounded-base"
                >
                  <Typography
                    weight="semibold"
                    className={`text-display ${color}`}
                  >
                    {value}
                  </Typography>
                  <Typography
                    weight="regular"
                    className="text-caption text-neutral-500"
                  >
                    {label}
                  </Typography>
                </View>
              ))}
            </View>

            {byChannel.length > 0 && (
              <>
                <Typography className="text-caption text-neutral-500 mb-2">
                  По каналам
                </Typography>

                <View className="bg-background-surface p-4 rounded-base gap-5">
                  {byChannel.map(({ channel, sent: s }) => {
                    const color =
                      CHANNEL_COLORS[channel] ?? colors.neutral[400];
                    return (
                      <View key={channel}>
                        <View className="flex-row justify-between mb-1">
                          <View className="flex-row items-center gap-1">
                            <View
                              className="w-[10px] h-[10px] rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <Typography weight="regular" className="text-body">
                              {CHANNEL_LABELS[channel] ?? channel}
                            </Typography>
                          </View>
                          <Typography
                            weight="regular"
                            className="text-body text-neutral-500"
                          >
                            {s}
                          </Typography>
                        </View>
                        <View className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                          <View
                            className="h-full rounded-full"
                            style={{
                              width: `${(s / maxSent) * 100}%`,
                              backgroundColor: color,
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>
        );
      }}
    </ScreenWithToolbar>
  );
};

export default NotificationsStatistics;
