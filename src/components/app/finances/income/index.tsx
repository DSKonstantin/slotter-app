import React, { useState } from "react";
import { useRefresh } from "@/src/hooks/useRefresh";
import { RefreshControl, ScrollView, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import TrendChartCard from "@/src/components/shared/cards/trendChartCard";
import { Card, Divider, SegmentedControl, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useGetFinancesIncomeQuery } from "@/src/store/redux/services/api/financesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { generateMonthRange } from "@/src/utils/date/generateMonthRange";
import { formatApiDate, subMonths } from "@/src/utils/date/formatDate";
import { Typography } from "@/src/components/ui";
import {
  INCOME_GROUP_OPTIONS,
  MONTH_NAMES_SHORT,
} from "@/src/constants/finances";
import FinancesIncomeSkeleton from "./FinancesIncomeSkeleton";
import IncomeBreakdownSkeleton from "./IncomeBreakdownSkeleton";
import IncomeBreakdownServices from "./IncomeBreakdownServices";
import IncomeBreakdownClients from "./IncomeBreakdownClients";

const today = new Date();

const PERIODS = [
  {
    label: "3 месяца",
    value: "3m",
    date_from: formatApiDate(subMonths(today, 3)),
    date_to: formatApiDate(today),
  },
  {
    label: "6 месяцев",
    value: "6m",
    date_from: formatApiDate(subMonths(today, 6)),
    date_to: formatApiDate(today),
  },
  {
    label: "За год",
    value: "1y",
    date_from: formatApiDate(new Date(today.getFullYear(), 0, 1)),
    date_to: formatApiDate(today),
  },
];

const formatPeriodLabel = (period: string) => {
  const monthIndex = parseInt(period.split("-")[1], 10) - 1;
  return MONTH_NAMES_SHORT[monthIndex] ?? period;
};

const FinancesIncomeScreen = () => {
  const auth = useRequiredAuth();
  const [groupBy, setGroupBy] = useState(INCOME_GROUP_OPTIONS[0].value);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);

  const {
    data,
    isLoading: isIncomeLoading,
    isFetching,
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

  const { refreshing, onRefresh } = useRefresh(refetch);

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

  const renderBreakdown = () => {
    if (isFetching) {
      return <IncomeBreakdownSkeleton />;
    }
    if (!data?.breakdown?.length) {
      return (
        <Typography className="text-body text-neutral-400 text-center py-2">
          {groupBy === "services"
            ? "Нет данных по услугам за период"
            : "Нет данных по клиентам за период"}
        </Typography>
      );
    }
    if (groupBy === "services") {
      return <IncomeBreakdownServices items={data.breakdown} />;
    }
    return <IncomeBreakdownClients items={data.breakdown} />;
  };

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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
            options={INCOME_GROUP_OPTIONS}
          />

          <View className="gap-3">{renderBreakdown()}</View>

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
