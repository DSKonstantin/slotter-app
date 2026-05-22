import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppDispatch } from "@/src/store/redux/store";
import { api } from "@/src/store/redux/services/api";
import { useGetSubscriptionPaymentQuery } from "@/src/store/redux/services/api/subscriptionApi";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";

export const PAYMENT_ID_KEY = "pending_payment_id";

const POLL_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 2_000;

const PaymentStatusScreen = () => {
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [shouldPoll, setShouldPoll] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PAYMENT_ID_KEY).then((val) => {
      if (val) setPaymentId(parseInt(val, 10));
    });
  }, []);

  const { data: payment } = useGetSubscriptionPaymentQuery(
    auth && paymentId && shouldPoll
      ? { userId: auth.userId, paymentId }
      : skipToken,
    { pollingInterval: POLL_INTERVAL_MS },
  );

  useEffect(() => {
    if (!payment) return;
    if (payment.status === "succeeded") {
      setShouldPoll(false);
      AsyncStorage.removeItem(PAYMENT_ID_KEY);
      dispatch(api.util.invalidateTags(["SubscriptionMembership"]));
    } else if (payment.status === "failed") {
      setShouldPoll(false);
    }
  }, [payment?.status, dispatch]);

  useEffect(() => {
    if (!paymentId) return;
    const timeout = setTimeout(() => {
      setShouldPoll(false);
      setTimedOut(true);
    }, POLL_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [paymentId]);

  if (!auth) return null;

  const goToSubscription = () =>
    router.replace(Routers.app.account.subscription);

  if (!paymentId) {
    return (
      <ScreenWithToolbar title="Статус оплаты">
        {() => (
          <View className="flex-1 items-center justify-center px-screen gap-4">
            <Typography
              weight="medium"
              className="text-body text-center text-neutral-900"
            >
              Не удалось определить платёж
            </Typography>
            <Button title="Проверить подписку" onPress={goToSubscription} />
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  if (payment?.status === "succeeded") {
    return (
      <ScreenWithToolbar title="Статус оплаты">
        {() => (
          <View className="flex-1 items-center justify-center px-screen gap-4">
            <StSvg
              name="Check_round_fill"
              size={56}
              color={colors.primary.blue[500]}
            />
            <View className="items-center gap-1">
              <Typography
                weight="semibold"
                className="text-heading-sm text-center"
              >
                Оплачено!
              </Typography>
              <Typography className="text-body text-center text-neutral-500">
                Pro-доступ активирован
              </Typography>
            </View>
            <Button title="Перейти к подписке" onPress={goToSubscription} />
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  if (payment?.status === "failed") {
    return (
      <ScreenWithToolbar title="Статус оплаты">
        {() => (
          <View className="flex-1 items-center justify-center px-screen gap-4">
            <StSvg
              name="Warning_fill"
              size={56}
              color={colors.accent.red[500]}
            />
            <View className="items-center gap-1">
              <Typography
                weight="semibold"
                className="text-heading-sm text-center"
              >
                Оплата не прошла
              </Typography>
              <Typography className="text-body text-center text-neutral-500">
                Попробуйте ещё раз или выберите другой способ оплаты
              </Typography>
            </View>
            <Button title="Попробовать снова" onPress={goToSubscription} />
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  if (timedOut) {
    return (
      <ScreenWithToolbar title="Статус оплаты">
        {() => (
          <View className="flex-1 items-center justify-center px-screen gap-4">
            <Typography
              weight="medium"
              className="text-body text-center text-neutral-500"
            >
              Платёж в обработке — проверим позже
            </Typography>
            <Button title="Перейти к подписке" onPress={goToSubscription} />
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  return (
    <ScreenWithToolbar title="Статус оплаты">
      {() => (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color={colors.primary.blue[500]} />
          <Typography className="text-body text-neutral-500">
            Проверяем оплату...
          </Typography>
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default PaymentStatusScreen;
