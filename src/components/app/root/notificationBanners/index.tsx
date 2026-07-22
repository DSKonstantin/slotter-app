import React, { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native";
import { useOpenPersonalAccount } from "@/src/hooks/useOpenPersonalAccount";
import { router } from "expo-router";
import { differenceInDays, parseISO } from "date-fns";

import { Routers } from "@/src/constants/routers";
import { useGetNotificationsQuery } from "@/src/store/redux/services/api/notificationsApi";
import { useAppSelector } from "@/src/store/redux/store";
import type {
  Notification,
  AppointmentNotificationSubject,
} from "@/src/store/redux/services/api-types";
import { formatApiDate, formatDayMonthLong } from "@/src/utils/date/formatDate";
import { pluralize } from "@/src/utils/text/pluralize";
import usePersistentStorage from "@/src/hooks/usePersistentStorage";
import { useSubscriptionQuota } from "@/src/hooks/useSubscriptionQuota";
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
  const openPersonalAccount = useOpenPersonalAccount();

  const { data } = useGetNotificationsQuery({ per_count: 50, is_read: false });

  const { quota, membership, shouldFetchQuota } = useSubscriptionQuota();

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

  const subscriptionBanner = useMemo(():
    | { status: "ended" }
    | { status: "expiring"; days: number }
    | null => {
    if (membership?.plan !== "pro") return null;

    if (!membership.pro_access && membership.period_starts_at !== null) {
      return { status: "ended" };
    }

    if (!membership.period_ends_at) return null;
    const days = differenceInDays(
      parseISO(membership.period_ends_at),
      new Date(),
    );
    if (days < 0 || days > SUBSCRIPTION_EXPIRY_DAYS) return null;
    return { status: "expiring", days };
  }, [membership]);

  const quotaRemaining = useMemo(() => {
    if (!quota) return null;
    const remaining = quota.limit - quota.used;
    return remaining <= QUOTA_WARNING_THRESHOLD ? remaining : null;
  }, [quota]);

  const quotaResetLabel = useMemo(
    () => (quota ? formatDayMonthLong(parseISO(quota.resets_at)) : null),
    [quota],
  );

  const handleOpenList = useCallback(
    () => router.push(Routers.app.history.root),
    [],
  );

  const handleOpenSubscription = useCallback(
    () => openPersonalAccount("/upgrade"),
    [openPersonalAccount],
  );

  useEffect(() => {
    if (subscriptionBanner?.status !== "ended" && subBannerClosed)
      setSubBannerClosed(false);
  }, [subscriptionBanner, subBannerClosed, setSubBannerClosed]);

  const showQuotaBanner = ispe && shouldFetchQuota && quotaRemaining !== null;

  const showSubscriptionBanner =
    ispe &&
    subscriptionBanner !== null &&
    (subscriptionBanner.status !== "ended" || !subBannerClosed);

  if (banners.length === 0 && !showSubscriptionBanner && !showQuotaBanner)
    return null;

  return (
    <View className="gap-2 px-screen">
      {showQuotaBanner && (
        <BannerCard
          variant={quotaRemaining <= 0 ? "error" : "alert"}
          iconName={quotaRemaining <= 0 ? "Stop_fill" : "Cancel_fill"}
          title={
            quotaRemaining <= 0
              ? "Лимит слотов на \n" + "месяц исчерпан"
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
      {showSubscriptionBanner && (
        <BannerCard
          variant={subscriptionBanner.status === "ended" ? "error" : "warning"}
          iconName={
            subscriptionBanner.status === "ended"
              ? "Alarm_fill"
              : "Hhourglass_move_light_fill"
          }
          title={
            subscriptionBanner.status === "ended"
              ? "Подписка закончилась"
              : subscriptionBanner.days === 0
                ? "Подписка истекает сегодня"
                : `Подписка истекает через ${subscriptionBanner.days} ${pluralize(subscriptionBanner.days, ["день", "дня", "дней"])}`
          }
          actionLabel="Продлить"
          onPress={handleOpenSubscription}
          onDismiss={
            subscriptionBanner.status === "ended"
              ? () => setSubBannerClosed(true)
              : undefined
          }
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
