import React, { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import TrendChartCard from "@/src/components/shared/cards/trendChartCard";
import {
  Card,
  Divider,
  SegmentedControl,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useGetFinancesIncomeQuery } from "@/src/store/redux/services/api/financesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { generateMonthRange } from "@/src/utils/date/generateMonthRange";
import FinancesIncomeSkeleton from "./FinancesIncomeSkeleton";

const GROUP_OPTIONS = [
  { label: "По услугам", value: "services" as const },
  { label: "По клиентам", value: "clients" as const },
];

const SHORT_MONTHS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const today = new Date();
const monthsAgo = (n: number) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() - n);
  return d;
};

const PERIODS = [
  {
    label: "3 месяца",
    value: "3m",
    date_from: formatDate(monthsAgo(3)),
    date_to: formatDate(today),
  },
  {
    label: "6 месяцев",
    value: "6m",
    date_from: formatDate(monthsAgo(6)),
    date_to: formatDate(today),
  },
  {
    label: "За год",
    value: "1y",
    date_from: formatDate(new Date(today.getFullYear(), 0, 1)),
    date_to: formatDate(today),
  },
];

const formatPeriodLabel = (period: string) => {
  const monthIndex = parseInt(period.split("-")[1], 10) - 1;
  return SHORT_MONTHS[monthIndex] ?? period;
};

const FinancesIncomeScreen = () => {
  const auth = useRequiredAuth();
  const [groupBy, setGroupBy] = useState(GROUP_OPTIONS[0].value);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);

  const {
    data,
    isLoading: isIncomeLoading,
    refetch,
  } = useGetFinancesIncomeQuery(
    auth
      ? {
          userId: auth.userId,
          date_from: selectedPeriod.date_from,
          date_to: selectedPeriod.date_to,
          group_by: groupBy,
        }
      : skipToken,
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const apiByMonth = Object.fromEntries(
    (data?.chart ?? []).map((p) => [p.month, p.amount_cents]),
  );

  const chartData = generateMonthRange(
    selectedPeriod.date_from,
    selectedPeriod.date_to,
  ).map((month) => ({
    value: apiByMonth[month] ?? 0,
    label: formatPeriodLabel(month),
  }));

  if (isIncomeLoading) {
    return (
      <ScreenWithToolbar title="Доходы по периоду">
        {({ topInset }) => <FinancesIncomeSkeleton topInset={topInset} />}
      </ScreenWithToolbar>
    );
  }

  return (
    <ScreenWithToolbar title="Доходы по периоду">
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 16,
            paddingHorizontal: 20,
            gap: 20,
          }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <TrendChartCard
            title="График доходов по месяцам"
            data={chartData.length > 0 ? chartData : undefined}
            periods={PERIODS}
            onPeriodChange={(p) =>
              setSelectedPeriod(
                PERIODS.find((pr) => pr.value === p.value) ?? PERIODS[0],
              )
            }
          />

          <Card
            title={data ? formatRublesFromCents(data.total_cents) : "—"}
            subtitle="Итого за период"
            titleProps={{ style: { fontSize: 20 } }}
          />

          <Divider />

          <SegmentedControl
            value={groupBy}
            onChange={(v) => setGroupBy(v as typeof groupBy)}
            options={GROUP_OPTIONS}
          />
          <View className="gap-3">
            {(data?.breakdown ?? []).map((item) => (
              <Card
                key={item.service_id ?? item.customer_id ?? item.name}
                title={item.name}
                subtitle={
                  groupBy === "clients"
                    ? [
                        formatRublesFromCents(item.total_cents),
                        item.appointments_count != null
                          ? `${item.appointments_count} визитов`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" | ")
                    : item.appointments_count != null
                      ? `${item.appointments_count} продаж`
                      : undefined
                }
                right={
                  groupBy === "services" ? (
                    <Typography
                      weight="medium"
                      className="text-body  text-neutral-900"
                    >
                      {formatRublesFromCents(item.total_cents)}
                    </Typography>
                  ) : null
                }
              />
            ))}
          </View>

          <Divider />

          <Card
            title="+ 54%"
            titleProps={{ style: { color: colors.primary.green[400] } }}
            subtitle="Тренд за период"
            left={
              <View className="mb-[18px]">
                <StSvg
                  name="Line_up"
                  size={24}
                  color={colors.primary.green[400]}
                />
              </View>
            }
          />
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default FinancesIncomeScreen;
