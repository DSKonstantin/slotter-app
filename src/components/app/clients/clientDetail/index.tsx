import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Avatar, IconButton, StSvg, Typography } from "@/src/components/ui";
import { useGetCustomerQuery } from "@/src/store/redux/services/api/customersApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";
import AppointmentStatusBadge from "@/src/components/app/clients/shared/appointmentStatusBadge";
import type { Appointment } from "@/src/store/redux/services/api-types";

const formatPrice = (cents: number, currency = "RUB") => {
  const amount = cents / 100;
  return `${amount.toLocaleString("ru-RU")} ₽`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

const formatTime = (timeStr: string) => timeStr.slice(0, 5);

type AppointmentRowProps = { item: Appointment };

const AppointmentRow = ({ item }: AppointmentRowProps) => {
  const serviceName =
    item.services[0]?.name ?? item.additional_services[0]?.name ?? "Услуга";
  const extraCount = item.services.length + item.additional_services.length - 1;

  return (
    <Pressable
      className="bg-white rounded-2xl p-4 gap-2 active:opacity-70"
      onPress={() => router.push(Routers.app.calendar.slot(item.id))}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="font-inter-semibold text-body text-neutral-900 flex-1 mr-2"
          numberOfLines={1}
        >
          {serviceName}
          {extraCount > 0 ? ` +${extraCount}` : ""}
        </Text>
        <AppointmentStatusBadge status={item.status} />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-regular text-caption text-neutral-500">
          {formatDate(item.date)} · {formatTime(item.start_time)}
        </Text>
        <Text className="font-inter-semibold text-body text-neutral-900">
          {formatPrice(item.price_cents)}
        </Text>
      </View>
    </Pressable>
  );
};

type StatBoxProps = { label: string; value: string };
const StatBox = ({ label, value }: StatBoxProps) => (
  <View className="flex-1 bg-white rounded-2xl p-4 items-center gap-1">
    <Text className="font-inter-bold text-[20px] text-neutral-900">
      {value}
    </Text>
    <Text className="font-inter-regular text-caption text-neutral-500 text-center">
      {label}
    </Text>
  </View>
);

type Props = { customerId: number };

const ClientDetail = ({ customerId }: Props) => {
  const auth = useRequiredAuth();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: customerData,
    isLoading: customerLoading,
    refetch: refetchCustomer,
  } = useGetCustomerQuery(
    auth ? { userId: auth.userId, customerId } : skipToken,
  );

  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useGetAppointmentsQuery(auth ? { userId: auth.userId } : skipToken);

  const customer = customerData?.customer;

  const appointments = React.useMemo(() => {
    if (!appointmentsData) return [];
    const all = Array.isArray(appointmentsData)
      ? appointmentsData
      : Object.values(appointmentsData).flat();
    return all.filter((a) => a.customer.id === customerId);
  }, [appointmentsData, customerId]);

  const totalSpent = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.price_cents, 0);

  const completedCount = appointments.filter(
    (a) => a.status === "completed",
  ).length;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetchCustomer(), refetchAppointments()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchAppointments, refetchCustomer]);

  if (!auth) return null;

  return (
    <ScreenWithToolbar
      title="Клиент"
      rightButton={
        <View className="flex-row gap-1">
          <IconButton
            icon={
              <StSvg name="Chart_fill" size={24} color={colors.neutral[900]} />
            }
            onPress={() =>
              router.push(Routers.app.clients.statistics(customerId))
            }
            accessibilityLabel="Статистика"
          />
          <IconButton
            icon={
              <StSvg name="Wallet_fill" size={24} color={colors.neutral[900]} />
            }
            onPress={() => router.push(Routers.app.clients.balance(customerId))}
            accessibilityLabel="Баланс"
          />
        </View>
      }
    >
      {({ topInset, bottomInset }) => {
        if (customerLoading) {
          return (
            <View
              className="flex-1 items-center justify-center"
              style={{ marginTop: topInset }}
            >
              <ActivityIndicator />
            </View>
          );
        }

        if (!customer) {
          return (
            <View
              className="flex-1 items-center justify-center"
              style={{ marginTop: topInset }}
            >
              <Typography className="text-body text-neutral-500">
                Клиент не найден
              </Typography>
            </View>
          );
        }

        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: topInset + 16,
              paddingBottom: bottomInset + 16,
              gap: 16,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            {/* Profile header */}
            <View className="px-screen items-center gap-3">
              <Avatar name={customer.name} size="xl" />
              <View className="items-center gap-1">
                <Text className="font-inter-semibold text-[22px] text-neutral-900">
                  {customer.name}
                </Text>
                {customer.phone ? (
                  <Text className="font-inter-regular text-body text-neutral-500">
                    {customer.phone}
                  </Text>
                ) : null}
              </View>
              {customer.customer_tag && (
                <View
                  className="h-[28px] px-3 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: customer.customer_tag.color + "22",
                  }}
                >
                  <Text
                    className="font-inter-medium text-caption"
                    style={{ color: customer.customer_tag.color }}
                  >
                    {customer.customer_tag.name}
                  </Text>
                </View>
              )}
            </View>

            {/* Stats */}
            <View className="px-screen flex-row gap-2">
              <StatBox label="Записей" value={String(appointments.length)} />
              <StatBox label="Завершено" value={String(completedCount)} />
              <StatBox label="Потрачено" value={formatPrice(totalSpent)} />
            </View>

            {/* Note */}
            {customer.note ? (
              <View className="px-screen bg-white rounded-2xl p-4 mx-4">
                <Text className="font-inter-regular text-body text-neutral-700">
                  {customer.note}
                </Text>
              </View>
            ) : null}

            {/* Appointments */}
            <View className="px-screen gap-3">
              <Text className="font-inter-semibold text-[16px] text-neutral-900">
                История записей
              </Text>
              {appointmentsLoading ? (
                <ActivityIndicator />
              ) : appointments.length === 0 ? (
                <View className="items-center py-6">
                  <Typography className="text-body text-neutral-400">
                    Записей нет
                  </Typography>
                </View>
              ) : (
                <View className="gap-2">
                  {appointments.map((item) => (
                    <AppointmentRow key={item.id} item={item} />
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        );
      }}
    </ScreenWithToolbar>
  );
};

export default ClientDetail;
