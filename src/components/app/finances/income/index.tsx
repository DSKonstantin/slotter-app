import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useRefresh } from "@/src/hooks/useRefresh";
import { Platform, RefreshControl, ScrollView, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import TrendChartCard from "@/src/components/shared/cards/trendChartCard";
import {
  Card,
  Divider,
  SegmentedControl,
  Typography,
} from "@/src/components/ui";
import { useGetFinancesIncomeQuery } from "@/src/store/redux/services/api/financesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { generateMonthRange } from "@/src/utils/date/generateMonthRange";
import { formatApiDate, subMonths } from "@/src/utils/date/formatDate";
import { safeRefetch } from "@/src/utils/safeRefetch";
import { useToday } from "@/src/hooks/useToday";
import {
  INCOME_GROUP_OPTIONS,
  MONTH_NAMES_SHORT,
} from "@/src/constants/finances";
import { SCREEN_PADDING } from "@/src/constants/layout";
import FinancesIncomeSkeleton from "./FinancesIncomeSkeleton";
import IncomeBreakdownSkeleton from "./IncomeBreakdownSkeleton";
import IncomeBreakdownServices from "./IncomeBreakdownServices";
import IncomeBreakdownClients from "./IncomeBreakdownClients";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";

const PERIOD_DEFS = [
  { label: "3 месяца", value: "3m" },
  { label: "6 месяцев", value: "6m" },
  { label: "За год", value: "1y" },
] as const;

type Period = (typeof PERIOD_DEFS)[number] & {
  date_from: string;
  date_to: string;
};

const buildPeriods = (today: Date): Period[] => {
  const dateTo = formatApiDate(today);
  return [
    {
      ...PERIOD_DEFS[0],
      date_from: formatApiDate(subMonths(today, 3)),
      date_to: dateTo,
    },
    {
      ...PERIOD_DEFS[1],
      date_from: formatApiDate(subMonths(today, 6)),
      date_to: dateTo,
    },
    {
      ...PERIOD_DEFS[2],
      date_from: formatApiDate(new Date(today.getFullYear(), 0, 1)),
      date_to: dateTo,
    },
  ];
};

const formatPeriodLabel = (period: string) => {
  const monthIndex = parseInt(period.split("-")[1], 10) - 1;
  return MONTH_NAMES_SHORT[monthIndex] ?? period;
};

const FinancesIncomeScreen = () => {
  const [groupBy, setGroupBy] = useState(INCOME_GROUP_OPTIONS[0].value);
  const [selectedValue, setSelectedValue] = useState<string>(
    PERIOD_DEFS[0].value,
  );
  const auth = useRequiredAuth();

  const today = useToday();
  const periods = useMemo(() => buildPeriods(today), [today]);
  const selectedPeriod = useMemo(
    () => periods.find((p) => p.value === selectedValue) ?? periods[0],
    [periods, selectedValue],
  );

  const {
    data,
    isLoading: isIncomeLoading,
    isError: isIncomeError,
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

  useFocusEffect(
    useCallback(() => {
      safeRefetch(refetch);
    }, [refetch]),
  );

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

  const renderBreakdown = () => {
    if (isFetching) return <IncomeBreakdownSkeleton />;
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
      {({ topInset, bottomInset }) => {
        if (isIncomeLoading)
          return <FinancesIncomeSkeleton topInset={topInset} />;
        if (isIncomeError)
          return (
            <ErrorScreen
              title="Не удалось загрузить доходы"
              onRetry={refetch}
            />
          );
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
              paddingHorizontal: SCREEN_PADDING,
              gap: 20,
            }}
            refreshControl={
              <RefreshControl
                progressViewOffset={Platform.select({
                  android: topInset,
                })}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            <TrendChartCard
              title="График доходов по месяцам"
              data={chartData.length > 0 ? chartData : undefined}
              periods={periods}
              onPeriodChange={(p) => setSelectedValue(p.value)}
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
          </ScrollView>
        );
      }}
    </ScreenWithToolbar>
  );
};

export default FinancesIncomeScreen;
