import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useRefresh } from "@/src/hooks/useRefresh";
import { RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { Routers } from "@/src/constants/routers";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useGetFinancesSummaryQuery } from "@/src/store/redux/services/api/financesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  Card,
  Divider,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { MONTH_NAMES } from "@/src/constants/finances";
import IncomeCard from "@/src/components/shared/cards/incomeCard";
import StatCard from "@/src/components/shared/cards/statСard";
import CreateExpenseModal from "./createExpenseModal";
import ExpenseCategoriesList from "./ExpenseCategoriesList";
import FinancesSkeleton from "./FinancesSkeleton";
import ErrorScreen from "@/src/components/shared/errorScreen";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();

const FinancesScreen = () => {
  const auth = useRequiredAuth();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useGetFinancesSummaryQuery(
    auth
      ? { userId: auth.userId, month: CURRENT_MONTH, year: CURRENT_YEAR }
      : skipToken,
  );

  useFocusEffect(
    useCallback(() => {
      refetchSummary();
    }, [refetchSummary]),
  );

  const { refreshing, onRefresh } = useRefresh(refetchSummary);

  const growth = summary?.growth_percent;
  const growthValue =
    growth != null ? `${growth > 0 ? "+" : ""}${growth}%` : "—";

  if (!auth) {
    return null;
  }

  if (isSummaryLoading) {
    return (
      <ScreenWithToolbar title="Финансы">
        {({ topInset }) => <FinancesSkeleton topInset={topInset} />}
      </ScreenWithToolbar>
    );
  }

  if (isSummaryError) {
    return (
      <ScreenWithToolbar title="Финансы">
        {() => (
          <ErrorScreen
            title="Не удалось загрузить финансы"
            onRetry={refetchSummary}
          />
        )}
      </ScreenWithToolbar>
    );
  }

  return (
    <ScreenWithToolbar title="Финансы">
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
          <IncomeCard
            label={`Доходы за ${MONTH_NAMES[CURRENT_MONTH - 1]}`}
            totalIncome={
              summary ? formatRublesFromCents(summary.income_cents) : "—"
            }
            items={[
              {
                label: "Визитов",
                value: summary ? String(summary.appointments_count) : "—",
              },
              {
                label: "Средний чек",
                value: summary
                  ? formatRublesFromCents(summary.average_check_cents)
                  : "—",
              },
              { label: "Рост", value: growthValue },
            ]}
          />

          <Card
            title="Доходы по периоду"
            onPress={() => router.push(Routers.app.menu.finances.income)}
            titleProps={{ style: { color: colors.primary.blue[500] } }}
            subtitle="Динамика по дням/месяцам"
            left={
              <View className="mb-[18px]">
                <StSvg
                  name="Calendar_fill"
                  size={24}
                  color={colors.primary.blue[500]}
                />
              </View>
            }
            right={
              <StSvg
                name="Expand_right_light"
                size={24}
                color={colors.neutral[500]}
              />
            }
          />

          <Divider />

          <View className="p-4 bg-background-surface rounded-base gap-4">
            <View className="flex-row justify-between items-center">
              <Typography weight="medium" className="text-body">
                Расходы
              </Typography>
              <IconButton
                size="sm"
                onPress={() => setIsExpenseModalOpen(true)}
                icon={
                  <StSvg
                    name="Add_ring_fill_light"
                    size={28}
                    color={colors.primary.blue[500]}
                  />
                }
              />
            </View>

            <Divider />

            <ExpenseCategoriesList
              expenses={summary?.expenses ?? []}
              isLoading={isSummaryLoading}
            />

            <Divider />

            <View className="flex-row justify-between items-center">
              <Typography className="text-body">Итого расходов</Typography>
              <Typography className="text-body">
                {summary
                  ? formatRublesFromCents(summary.total_expenses_cents)
                  : "—"}
              </Typography>
            </View>
          </View>

          <View className="flex-row gap-2.5">
            <StatCard
              value={"8 500 ₽"}
              label="Предоплаты"
              tag={{ title: "3 чел", size: "sm", variant: "info" }}
            />

            <StatCard
              value={
                summary ? formatRublesFromCents(summary.net_profit_cents) : "—"
              }
              label="Чистая прибыль"
              tag={{
                title: growthValue,
                size: "sm",
                variant: growth != null && growth < 0 ? "error" : "mint",
              }}
            />
          </View>

          <CreateExpenseModal
            visible={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
          />
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default FinancesScreen;
