import React, { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { skipToken } from "@reduxjs/toolkit/query";
import { addMonths, differenceInDays, parseISO, startOfMonth } from "date-fns";

import { Routers } from "@/src/constants/routers";
import { useGetNotificationsQuery } from "@/src/store/redux/services/api/notificationsApi";
import { useGetSubscriptionQuotaQuery } from "@/src/store/redux/services/api/subscriptionApi";
import { useAppSelector } from "@/src/store/redux/store";
import type {
  Notification,
  AppointmentNotificationSubject,
} from "@/src/store/redux/services/api-types";
import { formatApiDate, formatDayMonthLong } from "@/src/utils/date/formatDate";
import { pluralize } from "@/src/utils/text/pluralize";
import usePersistentStorage from "@/src/hooks/usePersistentStorage";
import { colors } from "@/src/styles/colors";

import BannerCard from "./BannerCard";
import type { BannerVariant } from "./BannerCard";

const SUBSCRIPTION_EXPIRY_DAYS = 7;
const QUOTA_WARNING_THRESHOLD = 3;

const MAX_BANNERS = 3;

type NotificationBannerConfig = {
  key: string;
  variant: BannerVariant;
  iconName: string;
  match: (n: Notification, today: string) => boolean;
  buildTitle: (count: number) => string;
  actionLabel: string;
};

const NOTIFICATION_BANNERS: NotificationBannerConfig[] = [
  {
    key: "pending",
    variant: "info",
    iconName: "Time_fill",
    match: (n) => n.kind === "appointment_requested",
    buildTitle: (count) =>
      `${count} ${pluralize(count, ["неподтверждённая запись", "неподтверждённые записи", "неподтверждённых записей"])}`,
    actionLabel: "Перейти",
  },
  {
    key: "reschedule",
    variant: "action",
    iconName: "Time_icon",
    match: (n) => n.kind === "appointment_reschedule_requested",
    buildTitle: (count) =>
      count === 1 ? "Запрос на перенос записи" : `${count} запроса на перенос`,
    actionLabel: "Ответить",
  },
  {
    key: "cancelledToday",
    variant: "alert",
    iconName: "Close_round_fill",
    match: (n, today) =>
      n.kind === "appointment_cancelled" &&
      (n.subject as AppointmentNotificationSubject | null)?.date === today,
    buildTitle: (count) =>
      count === 1 ? "Отмена на сегодня" : `${count} отмены на сегодня`,
    actionLabel: "Открыть",
  },
];

const NotificationBanners = () => {
  const ispe = useAppSelector((s) => s.appVersion.ispe);
  const membership = useAppSelector(
    (s) => s.auth.user?.subscription_membership,
  );
  const userId = useAppSelector((s) => s.auth.user?.id);
  const token = useAppSelector((s) => s.auth.token);

  const { data } = useGetNotificationsQuery({ per_count: 50, is_read: false });

  const { data: quota } = useGetSubscriptionQuotaQuery(
    userId && membership?.plan !== "pro" ? { userId } : skipToken,
  );

  const [subBannerClosed, setSubBannerClosed] = usePersistentStorage(
    "banner_subscription_ended",
    false,
  );

  const banners = useMemo(() => {
    const items = data?.notifications.filter((n) => n.read_at === null) ?? [];
    const today = formatApiDate(new Date());

    return NOTIFICATION_BANNERS.map((b) => ({
      ...b,
      count: items.filter((n) => b.match(n, today)).length,
    }))
      .filter((b) => b.count > 0)
      .slice(0, MAX_BANNERS);
  }, [data]);

  const subscriptionEnded = useMemo(() => {
    return (
      membership?.plan === "pro" &&
      !membership.pro_access &&
      membership.period_starts_at !== null
    );
  }, [membership]);

  const expiryDaysLeft = useMemo(() => {
    if (subscriptionEnded) return null;
    if (!membership?.period_ends_at || membership.plan !== "pro") return null;
    const days = differenceInDays(
      parseISO(membership.period_ends_at),
      new Date(),
    );
    return days >= 0 && days <= SUBSCRIPTION_EXPIRY_DAYS ? days : null;
  }, [membership, subscriptionEnded]);

  const quotaRemaining = useMemo(() => {
    if (!quota || quota.plan !== "free") return null;
    const remaining = quota.limit - quota.used;
    return remaining <= QUOTA_WARNING_THRESHOLD ? remaining : null;
  }, [quota]);

  const quotaResetLabel = useMemo(
    () => formatDayMonthLong(addMonths(startOfMonth(new Date()), 1)),
    [],
  );

  const handleOpenList = useCallback(
    () => router.push(Routers.app.history.root),
    [],
  );

  const handleOpenSubscription = useCallback(async () => {
    await WebBrowser.openBrowserAsync(
      `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/personal-account/${userId}?token=${token}`,
    );
  }, [userId, token]);

  useEffect(() => {
    if (!subscriptionEnded && subBannerClosed) setSubBannerClosed(false);
  }, [subscriptionEnded, subBannerClosed, setSubBannerClosed]);

  if (
    banners.length === 0 &&
    expiryDaysLeft === null &&
    !subscriptionEnded &&
    (!ispe || quotaRemaining === null)
  )
    return null;

  return (
    <View className="gap-2 px-screen">
      {ispe && quotaRemaining !== null && (
        <BannerCard
          variant={quotaRemaining <= 0 ? "error" : "alert"}
          iconName={quotaRemaining <= 0 ? "Stop_fill" : "Cancel_fill"}
          title={
            quotaRemaining <= 0
              ? "Лимит записей на этот месяц исчерпан"
              : `Осталось ${quotaRemaining} ${pluralize(quotaRemaining, ["запись", "записи", "записей"])}`
          }
          subtitle={
            quotaRemaining > 0 ? `Бесплатно до ${quotaResetLabel}` : undefined
          }
          subtitleProps={{ style: { color: colors.accent.orange[500] } }}
          actionLabel={quotaRemaining <= 0 ? "Оформить PRO" : "Перейти на PRO"}
          onPress={handleOpenSubscription}
        />
      )}
      {ispe && subscriptionEnded && !subBannerClosed && (
        <BannerCard
          variant="error"
          iconName="Alarm_fill"
          title="Подписка закончилась"
          actionLabel="Продлить"
          onPress={handleOpenSubscription}
          onDismiss={() => setSubBannerClosed(true)}
        />
      )}
      {ispe && expiryDaysLeft !== null && (
        <BannerCard
          variant="warning"
          iconName="Hhourglass_move_light_fill"
          title={
            expiryDaysLeft === 0
              ? "Подписка истекает сегодня"
              : `Подписка истекает через ${expiryDaysLeft} ${pluralize(expiryDaysLeft, ["день", "дня", "дней"])}`
          }
          actionLabel="Продлить"
          onPress={handleOpenSubscription}
        />
      )}
      {banners.map((b) => (
        <BannerCard
          key={b.key}
          variant={b.variant}
          iconName={b.iconName}
          title={b.buildTitle(b.count)}
          actionLabel={b.actionLabel}
          onPress={handleOpenList}
        />
      ))}
    </View>
  );
};

export default NotificationBanners;
