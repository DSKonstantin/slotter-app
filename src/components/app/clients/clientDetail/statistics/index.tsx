import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, Typography } from "@/src/components/ui";
import { useGetUserCustomerFinancesQuery } from "@/src/store/redux/services/api/userCustomersApi";
import type { UserCustomerPeriod } from "@/src/store/redux/services/api-types";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import RetryInline from "@/src/components/shared/retryInline";

const PERIODS: { label: string; value: UserCustomerPeriod }[] = [
  { label: "7 дней", value: "last_7_days" },
  { label: "30 дней", value: "last_30_days" },
  { label: "90 дней", value: "last_90_days" },
];

type BarChartProps = {
  data: { month: string; count: number }[];
};

const BarChart = ({ data }: BarChartProps) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <View className="flex-row items-end justify-between gap-1 h-[140px]">
      {data.map((item, index) => (
        <View key={index} className="flex-1 items-center gap-1">
          <View
            className="w-full rounded-t-lg bg-primary-blue-500"
            style={{ height: Math.max((item.count / max) * 120, 4) }}
          />
          <Text
            className="font-inter-regular text-[10px] text-neutral-400"
            numberOfLines={1}
          >
            {item.month}
          </Text>
        </View>
      ))}
    </View>
  );
};

type Props = { customerId: number };

const ClientStatistics = ({ customerId }: Props) => {
  const auth = useRequiredAuth();
  const [period, setPeriod] = useState<UserCustomerPeriod>("last_30_days");

  const { data, isLoading, isError, refetch } = useGetUserCustomerFinancesQuery(
    auth
      ? { userId: auth.userId, id: customerId, params: { period } }
      : skipToken,
  );

  const { refreshing, onRefresh } = useRefresh(refetch);

  const visitsByMonth = useMemo(() => {
    if (!data?.payments?.length) return [];
    const counts = new Map<string, number>();
    for (const p of data.payments) {
      const month = p.date.slice(0, 7);
      counts.set(month, (counts.get(month) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [data?.payments]);

  const lastVisitAt = useMemo(() => {
    if (!data?.payments?.length) return null;
    return data.payments.reduce(
      (max, p) => (p.date > max ? p.date : max),
      data.payments[0].date,
    );
  }, [data?.payments]);

  if (!auth) return null;

  return (
    <ScreenWithToolbar title="Статистика">
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset + 16,
            paddingBottom: bottomInset + 16,
            gap: 16,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="px-screen flex-row gap-2">
            {PERIODS.map((p) => (
              <Badge
                key={p.value}
                title={p.label}
                variant={period === p.value ? "primary" : "secondary"}
                size="sm"
                onPress={() => setPeriod(p.value)}
              />
            ))}
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator />
            </View>
          ) : isError ? (
            <View className="px-screen py-10">
              <RetryInline
                text="Не удалось загрузить статистику"
                onRetry={refetch}
                layout="column"
              />
            </View>
          ) : (
            <>
              <View className="mx-screen bg-white rounded-2xl p-4">
                <Text className="font-inter-semibold text-body text-neutral-900 mb-4">
                  Визиты
                </Text>
                {visitsByMonth.length > 0 ? (
                  <BarChart data={visitsByMonth} />
                ) : (
                  <View className="h-[140px] items-center justify-center">
                    <Typography className="text-caption text-neutral-400">
                      Нет данных за период
                    </Typography>
                  </View>
                )}
              </View>

              <View className="px-screen flex-row gap-2">
                <View className="flex-1 bg-white rounded-2xl p-4 gap-1">
                  <Text className="font-inter-bold text-[22px] text-neutral-900">
                    {data?.visits_count ?? 0}
                  </Text>
                  <Text className="font-inter-regular text-caption text-neutral-500">
                    Всего записей
                  </Text>
                </View>
                <View className="flex-1 bg-white rounded-2xl p-4 gap-1">
                  <Text className="font-inter-bold text-[22px] text-neutral-900">
                    {data?.payments?.length ?? 0}
                  </Text>
                  <Text className="font-inter-regular text-caption text-neutral-500">
                    Завершено
                  </Text>
                </View>
              </View>

              {lastVisitAt && (
                <View className="mx-screen bg-white rounded-2xl p-4 flex-row items-center justify-between">
                  <Text className="font-inter-regular text-body text-neutral-500">
                    Последний визит
                  </Text>
                  <Text className="font-inter-semibold text-body text-neutral-900">
                    {new Date(lastVisitAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default ClientStatistics;
