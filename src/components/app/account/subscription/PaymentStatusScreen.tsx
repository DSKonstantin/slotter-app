import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDispatch } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ToolbarTop from "@/src/components/navigation/toolbarTop";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { colors } from "@/src/styles/colors";
import { api } from "@/src/store/redux/services/api";
import { useGetSubscriptionPaymentQuery } from "@/src/store/redux/services/api/subscriptionApi";
import { useAppSelector } from "@/src/store/redux/store";

type DisplayState = "loading" | "succeeded" | "failed" | "timeout" | "noId";

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 60_000;

const PaymentStatusScreen = () => {
  const auth = useRequiredAuth();
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const { top, bottom } = useSafeAreaInsets();
  const { payment_id } = useLocalSearchParams<{ payment_id: string }>();

  const paymentId = payment_id ?? null;
  const [displayState, setDisplayState] = useState<DisplayState>("loading");
  const [isPolling, setIsPolling] = useState(true);

  const {
    data: payment,
    isError,
    error,
  } = useGetSubscriptionPaymentQuery(
    auth && paymentId ? { userId: auth.userId, paymentId } : skipToken,
    { pollingInterval: isPolling ? POLL_INTERVAL_MS : 0 },
  );

  const errorStatus = isError ? (error as { status?: number })?.status : null;
  const isSucceeded = payment?.status === "succeeded";
  const isFailed =
    payment?.status === "failed" ||
    payment?.status === "refunded" ||
    (isError && errorStatus !== 404);
  const noPaymentId = !paymentId || errorStatus === 404;

  useEffect(() => {
    if (isSucceeded) {
      setIsPolling(false);
      setDisplayState("succeeded");
      dispatch(api.util.invalidateTags(["SubscriptionMembership"]));
    } else if (isFailed) {
      setIsPolling(false);
      setDisplayState("failed");
    } else if (noPaymentId) {
      setIsPolling(false);
      setDisplayState("noId");
    }
  }, [isSucceeded, isFailed, noPaymentId, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPolling(false);
      setDisplayState((prev) => (prev === "loading" ? "timeout" : prev));
    }, POLL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!auth) return null;

  const isLoading = displayState === "loading";

  const DISPLAY = {
    loading: {
      title: "Проверяем оплату",
      subtitle: "Это займёт несколько секунд",
      buttonTitle: "Проверить подписку",
      buttonIcon: "Expand_right",
    },
    succeeded: {
      title: "Оплата прошла!",
      subtitle: "Подписка Pro активирована",
      buttonTitle: "Продолжить",
      buttonIcon: "Expand_right",
    },
    failed: {
      title: "Оплата не прошла",
      subtitle: "Попробуйте ещё раз или выберите другой способ оплаты",
      buttonTitle: "Попробовать снова",
      buttonIcon: "Refresh_2",
    },
    timeout: {
      title: "Платёж в обработке",
      subtitle: "Подписка активируется автоматически — проверьте позже",
      buttonTitle: "Проверить подписку",
      buttonIcon: "Expand_right",
    },
    noId: {
      title: "Не удалось определить платёж",
      subtitle: "Откройте экран подписки, чтобы проверить статус",
      buttonTitle: "Проверить подписку",
      buttonIcon: "Expand_right",
    },
  } as const;

  const { title, subtitle, buttonTitle, buttonIcon } = DISPLAY[displayState];

  return (
    <View className="flex-1">
      <ToolbarTop title="Статус оплаты" />
      <View
        className="flex-1 px-screen"
        style={{ paddingTop: TOOLBAR_HEIGHT + top, paddingBottom: bottom + 8 }}
      >
        <View className="flex-1 justify-center gap-4 pb-4">
          <View className="justify-center items-center h-[60px]">
            {displayState === "loading" ? (
              <ActivityIndicator
                size="large"
                color={colors.primary.blue[500]}
              />
            ) : displayState === "succeeded" ? (
              <StSvg
                name="Check_round_fill"
                size={60}
                color={colors.primary.blue[500]}
              />
            ) : displayState === "timeout" ? (
              <StSvg name="Time" size={60} color={colors.neutral[400]} />
            ) : (
              <StSvg
                name="Close_round_fill"
                size={60}
                color={colors.accent.red[500]}
              />
            )}
          </View>

          <Typography weight="semibold" className="text-display text-center">
            {title}
          </Typography>

          <Typography className="text-body text-neutral-500 text-center">
            {subtitle}
          </Typography>
        </View>

        <View
          style={{ opacity: isLoading ? 0 : 1 }}
          pointerEvents={isLoading ? "none" : "auto"}
        >
          <Button
            title={buttonTitle}
            onPress={() =>
              Linking.openURL(
                `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/personal-account/${auth?.userId}?token=${token}`,
              )
            }
            rightIcon={<StSvg name={buttonIcon} size={20} color="white" />}
          />
        </View>
      </View>
    </View>
  );
};

export default PaymentStatusScreen;
