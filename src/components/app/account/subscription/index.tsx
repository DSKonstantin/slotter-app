import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, Button, Divider, StSvg, Typography } from "@/src/components/ui";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import SubscriptionSkeleton from "./SubscriptionSkeleton";
import { PAYMENT_ID_KEY } from "./PaymentStatusScreen";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { formatDayMonthYearLong } from "@/src/utils/date/formatDate";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import {
  useGetSubscriptionMembershipQuery,
  useGetSubscriptionPlansQuery,
  useGetSubscriptionQuotaQuery,
  useCheckoutMutation,
  useCancelSubscriptionMutation,
} from "@/src/store/redux/services/api/subscriptionApi";
import type {
  SubscriptionMembership,
  SubscriptionPlan,
} from "@/src/store/redux/services/api-types";

function statusBadge(membership: SubscriptionMembership): {
  title: string;
  variant: "mint" | "info" | "error";
} {
  if (membership.plan === "pro") {
    if (membership.status === "active")
      return { title: "Pro", variant: "mint" };
    if (membership.status === "cancelled")
      return { title: "Pro", variant: "info" };
    if (membership.status === "grace")
      return { title: "Pro", variant: "error" };
  }
  return { title: "Free", variant: "info" };
}

function statusDescription(membership: SubscriptionMembership): string {
  const endsAt = membership.period_ends_at
    ? formatDayMonthYearLong(new Date(membership.period_ends_at))
    : null;

  if (membership.plan === "pro") {
    if (membership.status === "active")
      return endsAt ? `Активен до ${endsAt}` : "Активен";
    if (membership.status === "cancelled")
      return endsAt
        ? `Доступен до ${endsAt}. Автопродление отключено`
        : "Автопродление отключено";
    if (membership.status === "grace")
      return "Не удалось списать оплату. Pro-доступ сохранён на несколько дней";
  }
  return "До 30 записей в месяц";
}

type PlanCardProps = {
  plan: SubscriptionPlan;
  discount: number;
  loadingId: number | null;
  onCheckout: (planId: number) => void;
  buttonTitle: string;
};

const PlanCard = ({
  plan,
  discount,
  loadingId,
  onCheckout,
  buttonTitle,
}: PlanCardProps) => (
  <View className="p-4 bg-background-surface rounded-base gap-3">
    <View className="flex-row items-center justify-between">
      <Typography weight="semibold" className="text-body">
        {plan.name}
      </Typography>
      {discount > 0 && (
        <Badge title={`−${discount}%`} variant="mint" size="sm" />
      )}
    </View>
    <View className="gap-0.5">
      <Typography weight="bold" className="text-heading-sm">
        {formatRublesFromCents(plan.price_cents)}
      </Typography>
      <Typography className="text-caption text-neutral-500">
        {formatRublesFromCents(plan.monthly_price_cents)} / мес
      </Typography>
    </View>
    <Button
      title={buttonTitle}
      loading={loadingId === plan.id}
      disabled={loadingId !== null && loadingId !== plan.id}
      onPress={() => onCheckout(plan.id)}
    />
  </View>
);

const SubscriptionScreen = () => {
  const auth = useRequiredAuth();
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<number | null>(
    null,
  );
  const isPendingPayment = useRef(false);

  const {
    data: membership,
    isLoading: isMembershipLoading,
    isError,
    refetch: refetchMembership,
  } = useGetSubscriptionMembershipQuery(
    auth ? { userId: auth.userId } : skipToken,
    { refetchOnMountOrArgChange: true },
  );

  const { data: plans, isLoading: isPlansLoading } =
    useGetSubscriptionPlansQuery();

  const { data: quota } = useGetSubscriptionQuotaQuery(
    auth && membership?.plan === "free" ? { userId: auth.userId } : skipToken,
  );

  const [checkout] = useCheckoutMutation();
  const [cancelSubscription, { isLoading: isCancelling }] =
    useCancelSubscriptionMutation();

  const { refreshing, onRefresh } = useRefresh(refetchMembership);

  const handleCheckout = async (planId: number) => {
    if (!auth) return;
    try {
      setCheckoutLoadingId(planId);
      const result = await checkout({
        userId: auth.userId,
        subscriptionPlanId: planId,
      }).unwrap();
      await AsyncStorage.setItem(PAYMENT_ID_KEY, String(result.payment_id));
      await Linking.openURL(result.confirmation_url);
      isPendingPayment.current = true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось инициировать оплату"));
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  const handleCancel = () => {
    if (!auth || !membership) return;
    const endsAt = membership.period_ends_at
      ? formatDayMonthYearLong(new Date(membership.period_ends_at))
      : null;
    Alert.alert(
      "Отменить подписку?",
      endsAt
        ? `Pro-доступ сохранится до ${endsAt}`
        : "Автопродление будет отключено",
      [
        { text: "Назад", style: "cancel" },
        {
          text: "Отменить подписку",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelSubscription({ userId: auth.userId }).unwrap();
              toast.success("Подписка отменена");
            } catch (error) {
              toast.error(
                getApiErrorMessage(error, "Не удалось отменить подписку"),
              );
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && isPendingPayment.current) {
        isPendingPayment.current = false;
        router.push(Routers.paymentStatus);
      }
    });
    return () => sub.remove();
  }, []);

  if (!auth) return null;

  const activePlans = (plans ?? [])
    .filter((p) => p.is_active)
    .sort((a, b) => a.position - b.position);
  const isProActive =
    membership?.plan === "pro" && membership?.status === "active";
  const checkoutButtonTitle =
    membership?.status === "grace" ? "Обновить карту" : "Оплатить";

  return (
    <ScreenWithToolbar title="Подписка">
      {({ topInset, bottomInset }) => {
        if (isError && !membership) {
          return (
            <ErrorScreen
              title="Не удалось загрузить данные подписки"
              onRetry={refetchMembership}
            />
          );
        }

        if ((isMembershipLoading || isPlansLoading) && !membership && !plans) {
          return (
            <SubscriptionSkeleton
              topInset={topInset}
              bottomInset={bottomInset}
            />
          );
        }

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
              gap: 16,
            }}
            refreshControl={
              <RefreshControl
                progressViewOffset={Platform.select({ android: topInset })}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            {/* Status card */}
            {membership && (
              <View className="p-4 bg-background-surface rounded-base gap-3">
                <View className="flex-row items-center justify-between">
                  <Typography weight="semibold" className="text-body">
                    Текущий тариф
                  </Typography>
                  <Badge {...statusBadge(membership)} size="sm" />
                </View>
                <Typography className="text-caption text-neutral-500">
                  {statusDescription(membership)}
                </Typography>
                {membership.plan === "free" && quota && (
                  <>
                    <View className="flex-row justify-between">
                      <Typography className="text-caption text-neutral-500">
                        Записей в этом месяце
                      </Typography>
                      <Typography
                        weight="medium"
                        className={`text-caption ${quota.used >= quota.limit ? "text-accent-red-500" : "text-neutral-900"}`}
                      >
                        {quota.used} / {quota.limit}
                      </Typography>
                    </View>
                    <View className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <View
                        className={`h-full rounded-full ${quota.used >= quota.limit ? "bg-accent-red-500" : "bg-primary-blue-500"}`}
                        style={{
                          width: `${Math.min((quota.used / quota.limit) * 100, 100)}%`,
                        }}
                      />
                    </View>
                    <Typography className="text-caption text-neutral-400">
                      Сбрасывается{" "}
                      {formatDayMonthYearLong(new Date(quota.resets_at))}
                    </Typography>
                  </>
                )}
              </View>
            )}

            {/* Grace banner */}
            {membership?.status === "grace" && (
              <View className="p-4 bg-background-surface rounded-base flex-row gap-3 items-start">
                <StSvg
                  name="Warning_fill"
                  size={20}
                  color={colors.accent.red[500]}
                />
                <View className="flex-1 gap-1">
                  <Typography weight="medium" className="text-caption">
                    Проблема с оплатой
                  </Typography>
                  <Typography className="text-caption text-neutral-500">
                    Обновите данные карты — выберите тариф и оплатите снова
                  </Typography>
                </View>
              </View>
            )}

            {!isProActive && activePlans.length > 0 && (
              <>
                <Divider />
                <Typography weight="medium" className="text-body">
                  Выберите тариф
                </Typography>
                {activePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    discount={plan.discount_percent}
                    loadingId={checkoutLoadingId}
                    onCheckout={handleCheckout}
                    buttonTitle={checkoutButtonTitle}
                  />
                ))}
              </>
            )}

            {/* Cancel button */}
            {isProActive && (
              <>
                <Divider />
                <Button
                  title="Отменить подписку"
                  variant="secondary"
                  loading={isCancelling}
                  onPress={handleCancel}
                  rightIcon={
                    <StSvg
                      name="Trash"
                      size={24}
                      color={colors.accent.red[500]}
                    />
                  }
                />
              </>
            )}
          </ScrollView>
        );
      }}
    </ScreenWithToolbar>
  );
};

export default SubscriptionScreen;
