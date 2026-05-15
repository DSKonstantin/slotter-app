import React, { useCallback, useMemo, useState } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  parseISO,
  isThisMonth,
  isAfter,
  subMonths,
  startOfMonth,
  format,
} from "date-fns";
import { ru } from "date-fns/locale";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Avatar,
  Card,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import IncomeCard from "@/src/components/shared/cards/incomeCard";
import { colors } from "@/src/styles/colors";
import TrendChartCard from "@/src/components/shared/cards/trendChartCard";
import ServiceCard from "@/src/components/app/clients/clientDetail/history/ServiceCard";
import {
  useGetUserCustomerFinancesQuery,
  useGetUserCustomerAppointmentsQuery,
  useGetUserCustomerQuery,
} from "@/src/store/redux/services/api/userCustomersApi";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { formatDayMonth } from "@/src/utils/date/formatTime";
import type { Appointment } from "@/src/store/redux/services/api-types";
import type { UserCustomerPeriod } from "@/src/store/redux/services/api-types/userCustomer";
import HistorySkeleton from "@/src/components/app/clients/clientDetail/history/HistorySkeleton";

const FINANCE_PERIODS: { label: string; value: UserCustomerPeriod }[] = [
  { label: "День", value: "today" },
  { label: "Неделя", value: "current_week" },
  { label: "Месяц", value: "current_month" },
];

const groupAppointmentsByPeriod = (appointments: Appointment[]) => {
  const threeMonthsAgo = subMonths(startOfMonth(new Date()), 3);

  const sections: { title: string; items: Appointment[] }[] = [
    { title: "В этом месяце", items: [] },
    { title: "За прошлые 3 месяца", items: [] },
    { title: "Ранее", items: [] },
  ];

  for (const appt of appointments) {
    const date = parseISO(appt.date);
    if (isThisMonth(date)) {
      sections[0].items.push(appt);
    } else if (isAfter(date, threeMonthsAgo)) {
      sections[1].items.push(appt);
    } else {
      sections[2].items.push(appt);
    }
  }

  return sections.filter((s) => s.items.length > 0);
};

type Props = { customerId: number };

const ClientHistory = ({ customerId }: Props) => {
  const auth = useRequiredAuth();
  const [filterActive, setFilterActive] = useState(false);
  const [financePeriod, setFinancePeriod] = useState(FINANCE_PERIODS[0]);

  const { data: customerData } = useGetUserCustomerQuery(
    auth ? { userId: auth.userId, userCustomerId: customerId } : skipToken,
  );

  const {
    data: financesData,
    isLoading: financesLoading,
    refetch: refetchFinances,
  } = useGetUserCustomerFinancesQuery(
    auth && !filterActive
      ? {
          userId: auth.userId,
          id: customerId,
          params: { period: financePeriod.value },
        }
      : skipToken,
    { refetchOnMountOrArgChange: true },
  );

  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useGetUserCustomerAppointmentsQuery(
    auth && filterActive
      ? { userId: auth.userId, id: customerId, params: { sort: "asc" } }
      : skipToken,
    { refetchOnMountOrArgChange: true },
  );

  const { user_customer: userCustomer } = customerData ?? {};
  const { customer, stats } = userCustomer ?? {};

  const chartData = useMemo(
    () =>
      financesData?.chart.map((point) => ({
        value: point.amount_cents,
        label: format(parseISO(point.month + "-01"), "MMM", { locale: ru }),
      })) ?? [],
    [financesData],
  );

  const appointmentSections = useMemo(
    () => groupAppointmentsByPeriod(appointmentsData?.appointments ?? []),
    [appointmentsData],
  );

  const lastVisitAt = stats?.last_visit_at;
  const lastVisitLabel = lastVisitAt
    ? format(parseISO(lastVisitAt), "d MMM yyyy", { locale: ru })
    : "—";

  const isLoading = filterActive ? appointmentsLoading : financesLoading;

  const handleRefresh = useCallback(
    () => (filterActive ? refetchAppointments() : refetchFinances()),
    [filterActive, refetchAppointments, refetchFinances],
  );
  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  return (
    <ScreenWithToolbar
      title="История посещений"
      rightButton={
        <IconButton
          icon={
            <StSvg
              name="Sort_arrow"
              size={28}
              color={
                filterActive ? colors.primary.blue[500] : colors.neutral[900]
              }
            />
          }
          onPress={() => setFilterActive((v) => !v)}
        />
      }
    >
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 8,
            paddingHorizontal: SCREEN_PADDING,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="items-center mb-5">
            <View className="flex-row gap-2 bg-background-surface rounded-base py-1 pl-1 pr-2.5 items-center">
              <Avatar
                size="xs"
                name={customer?.name}
                uri={customer?.avatar_url ?? undefined}
              />
              <Typography className="text-body">
                {customer?.name ?? ""}
              </Typography>
            </View>
          </View>

          {isLoading ? (
            <HistorySkeleton filterActive={filterActive} />
          ) : filterActive ? (
            <View className="gap-6">
              {appointmentSections.map((section) => (
                <View key={section.title} className="gap-4">
                  <Typography className="text-body">{section.title}</Typography>
                  <FlashList
                    data={section.items}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={2}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View className="h-3" />}
                    renderItem={({ item, index }) => {
                      const name =
                        item.services.map((s) => s.name).join(" + ") ||
                        "Запись";
                      return (
                        <View
                          style={{
                            flex: 1,
                            marginRight: index % 2 === 0 ? 6 : 0,
                          }}
                        >
                          <ServiceCard
                            service={{ name }}
                            date={formatDayMonth(item.date)}
                            onPress={() =>
                              router.push(Routers.app.calendar.slot(item.id))
                            }
                          />
                        </View>
                      );
                    }}
                  />
                </View>
              ))}
              {appointmentSections.length === 0 && (
                <View className="items-center py-10">
                  <Typography className="text-body text-neutral-400">
                    Нет посещений
                  </Typography>
                </View>
              )}
            </View>
          ) : (
            <View className="gap-5">
              <IncomeCard
                totalIncome={formatRublesFromCents(
                  financesData?.total_income_cents ?? 0,
                )}
                items={[
                  {
                    label: "Визитов",
                    value: String(financesData?.visits_count ?? 0),
                  },
                  { label: "Последний визит", value: lastVisitLabel },
                ]}
              />

              <TrendChartCard
                title="Динамика"
                data={chartData}
                periods={FINANCE_PERIODS}
                onPeriodChange={(p) =>
                  setFinancePeriod(p as (typeof FINANCE_PERIODS)[number])
                }
              />

              <View className="gap-2">
                <Typography className="text-caption">История оплат</Typography>
                {(financesData?.payments ?? []).map((payment) => (
                  <Card
                    key={payment.appointment_id}
                    title={payment.title}
                    subtitle={`${formatDayMonth(payment.date)} | ${payment.start_time}`}
                    onPress={() =>
                      router.push(
                        Routers.app.calendar.slot(payment.appointment_id),
                      )
                    }
                    right={
                      <Typography className="text-body">
                        {formatRublesFromCents(payment.amount_cents)}
                      </Typography>
                    }
                  />
                ))}
                {(financesData?.payments ?? []).length === 0 && (
                  <View className="items-center py-6">
                    <Typography className="text-body text-neutral-400">
                      Нет оплат за период
                    </Typography>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default ClientHistory;
