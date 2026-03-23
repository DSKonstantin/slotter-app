import React, { useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, Typography } from "@/src/components/ui";
import { useGetCustomerBalanceQuery } from "@/src/store/redux/services/api/customersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";

const PERIODS = [
  { label: "Неделя", value: "week" },
  { label: "Месяц", value: "month" },
  { label: "Год", value: "year" },
  { label: "Всё время", value: "all" },
];

const formatPrice = (cents: number) => {
  const amount = cents / 100;
  return `${amount.toLocaleString("ru-RU")} ₽`;
};

type LineChartProps = {
  data: { period: string; amount_cents: number }[];
};

const LineChart = ({ data }: LineChartProps) => {
  const max = Math.max(...data.map((d) => d.amount_cents), 1);
  const points = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * 100,
    y: 100 - (d.amount_cents / max) * 80,
  }));

  return (
    <View className="h-[120px] flex-row items-end justify-between gap-1 pt-2">
      {data.map((item, index) => (
        <View key={index} className="flex-1 items-center gap-1">
          <View
            className="w-2 rounded-full bg-primary-blue-500"
            style={{
              height: Math.max((item.amount_cents / max) * 90, 4),
            }}
          />
          {index % Math.ceil(data.length / 4) === 0 && (
            <Text className="font-inter-regular text-[10px] text-neutral-400" numberOfLines={1}>
              {item.period}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

type Props = { customerId: number };

const ClientBalance = ({ customerId }: Props) => {
  const auth = useRequiredAuth();
  const [period, setPeriod] = useState("all");

  const { data, isLoading } = useGetCustomerBalanceQuery(
    auth ? { userId: auth.userId, customerId, period } : skipToken,
  );

  if (!auth) return null;

  return (
    <ScreenWithToolbar title="Баланс клиента">
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset + 16,
            paddingBottom: bottomInset + 16,
            gap: 16,
          }}
        >
          {/* Total amount */}
          <View className="px-screen items-center py-4">
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text className="font-inter-regular text-caption text-neutral-500 mb-1">
                  Общая сумма
                </Text>
                <Text className="font-inter-bold text-[36px] text-neutral-900">
                  {data ? formatPrice(data.total_cents) : "—"}
                </Text>
              </>
            )}
          </View>

          {/* Period selector */}
          <View className="px-screen flex-row flex-wrap gap-2">
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

          {!isLoading && (
            <>
              {/* Chart */}
              <View className="mx-screen bg-white rounded-2xl p-4">
                <Text className="font-inter-semibold text-body text-neutral-900 mb-3">
                  Динамика
                </Text>
                {data?.chart && data.chart.length > 0 ? (
                  <LineChart data={data.chart} />
                ) : (
                  <View className="h-[120px] items-center justify-center">
                    <Typography className="text-caption text-neutral-400">
                      Нет данных за период
                    </Typography>
                  </View>
                )}
              </View>

              {/* Transactions list */}
              {data?.chart && data.chart.length > 0 && (
                <View className="px-screen gap-3">
                  <Text className="font-inter-semibold text-[16px] text-neutral-900">
                    По периодам
                  </Text>
                  <View className="gap-2">
                    {[...data.chart].reverse().map((item, index) => (
                      <View
                        key={index}
                        className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
                      >
                        <Text className="font-inter-regular text-body text-neutral-700">
                          {item.period}
                        </Text>
                        <Text className="font-inter-semibold text-body text-neutral-900">
                          {formatPrice(item.amount_cents)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default ClientBalance;
