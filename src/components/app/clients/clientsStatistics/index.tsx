import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, Divider, StSvg, Typography } from "@/src/components/ui";
import StatCard from "@/src/components/shared/cards/statСard";
import { pluralize } from "@/src/utils/text/pluralize";
import { colors } from "@/src/styles/colors";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetUserCustomersStatisticsQuery } from "@/src/store/redux/services/api/userCustomersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { SCREEN_PADDING } from "@/src/constants/layout";
import PeriodModal, {
  PERIODS,
  CUSTOM_PERIOD_VALUE,
  type Period,
} from "./periodModal";
import ClientsStatisticsSkeleton from "./ClientsStatisticsSkeleton";

function deltaTag(
  delta: number | null,
): { title: string; size: "sm"; variant: "mint" | "error" } | undefined {
  if (delta === null) return undefined;
  const positive = delta >= 0;
  return {
    title: `${positive ? "+" : ""}${delta}%`,
    size: "sm",
    variant: positive ? "mint" : "error",
  };
}

const ClientsStatistics = () => {
  const auth = useRequiredAuth();
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(PERIODS[1]);

  const queryParams =
    selectedPeriod.value === CUSTOM_PERIOD_VALUE
      ? {
          period: CUSTOM_PERIOD_VALUE,
          date_from: (selectedPeriod as { date_from?: string }).date_from,
          date_to: (selectedPeriod as { date_to?: string }).date_to,
        }
      : { period: selectedPeriod.value };

  const { data, isLoading, isError, refetch } =
    useGetUserCustomersStatisticsQuery(
      auth ? { userId: auth.userId, params: queryParams } : skipToken,
      { refetchOnMountOrArgChange: true },
    );

  const { refreshing, onRefresh } = useRefresh(
    useCallback(() => refetch(), [refetch]),
  );

  const handleSelectPeriod = (period: Period) => {
    setSelectedPeriod(period);
    if (period.value !== CUSTOM_PERIOD_VALUE) {
      setPeriodModalVisible(false);
    }
  };

  return (
    <ScreenWithToolbar title="Статистика клиентов">
      {({ topInset, bottomInset }) => (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: topInset,
              paddingBottom: bottomInset + 16,
              paddingHorizontal: SCREEN_PADDING,
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View className="gap-2 mb-6">
              <Typography
                weight="medium"
                className="text-caption text-neutral-500"
              >
                Период
              </Typography>
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center justify-between bg-background-surface rounded-small min-h-[48px] px-4"
                onPress={() => setPeriodModalVisible(true)}
              >
                <Typography
                  weight="medium"
                  className="text-body text-neutral-900"
                >
                  {selectedPeriod.label}
                </Typography>
                <StSvg
                  name="Date_today"
                  size={20}
                  color={colors.neutral[500]}
                />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ClientsStatisticsSkeleton />
            ) : isError || !data ? (
              <View className="items-center py-10">
                <Typography className="text-body text-neutral-400">
                  Не удалось загрузить статистику
                </Typography>
              </View>
            ) : (
              <>
                <View className="flex-row gap-2 mb-2">
                  <StatCard
                    value={data.new_clients.count}
                    label="Новые"
                    tag={deltaTag(data.new_clients.delta_percent)}
                  />
                  <StatCard
                    value={data.returned_clients.count}
                    label="Вернувшиеся"
                    tag={deltaTag(data.returned_clients.delta_percent)}
                  />
                </View>

                <View className="flex-row gap-2 mb-6">
                  <StatCard
                    value={formatRublesFromCents(data.avg_check.amount_cents)}
                    label="Средний чек"
                    tag={deltaTag(data.avg_check.delta_percent)}
                  />
                  <StatCard
                    value={data.lost_clients.count}
                    label="Потерянные"
                    tag={deltaTag(data.lost_clients.delta_percent)}
                  />
                </View>

                <View className="bg-background-surface rounded-base p-4 gap-4 mb-6">
                  <Typography
                    weight="semibold"
                    className="text-body text-neutral-900"
                  >
                    Статистика по услугам
                  </Typography>

                  <Divider />

                  {data.services.length === 0 ? (
                    <Typography className="text-body text-neutral-400 text-center py-2">
                      Нет данных за выбранный период
                    </Typography>
                  ) : (
                    data.services.map((service, index) => (
                      <React.Fragment key={service.service_id}>
                        <View className="flex-row items-center justify-between">
                          <Typography className="text-body text-neutral-500">
                            {service.name}
                          </Typography>
                          <Typography
                            weight="regular"
                            className="text-body text-neutral-900"
                          >
                            {service.customers_count}{" "}
                            {pluralize(service.customers_count, [
                              "клиент",
                              "клиента",
                              "клиентов",
                            ])}
                          </Typography>
                        </View>
                        {index < data.services.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  )}
                </View>
              </>
            )}

            <Button
              title="Выбрать клиента для просмотра истории"
              onPress={() => router.back()}
            />
          </ScrollView>

          <PeriodModal
            visible={periodModalVisible}
            selectedPeriod={selectedPeriod}
            onClose={() => setPeriodModalVisible(false)}
            onSelectPeriod={handleSelectPeriod}
          />
        </>
      )}
    </ScreenWithToolbar>
  );
};

export default ClientsStatistics;
