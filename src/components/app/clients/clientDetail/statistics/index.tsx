import React, { useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, Typography } from "@/src/components/ui";
import { useGetCustomerStatsQuery } from "@/src/store/redux/services/api/customersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";

const PERIODS = [
  { label: "Неделя", value: "week" },
  { label: "Месяц", value: "month" },
  { label: "Год", value: "year" },
];

type BarChartProps = {
  data: { period: string; count: number }[];
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
          <Text className="font-inter-regular text-[10px] text-neutral-400" numberOfLines={1}>
            {item.period}
          </Text>
        </View>
      ))}
    </View>
  );
};

type Props = { customerId: number };

const ClientStatistics = ({ customerId }: Props) => {
  const auth = useRequiredAuth();
  const [period, setPeriod] = useState("month");

  const { data, isLoading } = useGetCustomerStatsQuery(
    auth ? { userId: auth.userId, customerId, period } : skipToken,
  );

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
        >
          {/* Period selector */}
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
          ) : (
            <>
              {/* Chart */}
              <View className="mx-screen bg-white rounded-2xl p-4">
                <Text className="font-inter-semibold text-body text-neutral-900 mb-4">
                  Визиты
                </Text>
                {data?.chart && data.chart.length > 0 ? (
                  <BarChart data={data.chart} />
                ) : (
                  <View className="h-[140px] items-center justify-center">
                    <Typography className="text-caption text-neutral-400">
                      Нет данных за период
                    </Typography>
                  </View>
                )}
              </View>

              {/* Summary stats */}
              {data?.stats && (
                <View className="px-screen flex-row gap-2">
                  <View className="flex-1 bg-white rounded-2xl p-4 gap-1">
                    <Text className="font-inter-bold text-[22px] text-neutral-900">
                      {data.stats.total_appointments}
                    </Text>
                    <Text className="font-inter-regular text-caption text-neutral-500">
                      Всего записей
                    </Text>
                  </View>
                  <View className="flex-1 bg-white rounded-2xl p-4 gap-1">
                    <Text className="font-inter-bold text-[22px] text-neutral-900">
                      {data.stats.completed_appointments}
                    </Text>
                    <Text className="font-inter-regular text-caption text-neutral-500">
                      Завершено
                    </Text>
                  </View>
                </View>
              )}

              {data?.stats?.last_visit_at && (
                <View className="mx-screen bg-white rounded-2xl p-4 flex-row items-center justify-between">
                  <Text className="font-inter-regular text-body text-neutral-500">
                    Последний визит
                  </Text>
                  <Text className="font-inter-semibold text-body text-neutral-900">
                    {new Date(data.stats.last_visit_at).toLocaleDateString("ru-RU", {
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
