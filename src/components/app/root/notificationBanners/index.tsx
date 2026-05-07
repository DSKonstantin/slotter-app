import React, { useMemo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { format } from "date-fns";

import { Routers } from "@/src/constants/routers";
import { useGetNotificationsQuery } from "@/src/store/redux/services/api/notificationsApi";
import type { Notification } from "@/src/store/redux/services/api-types";
import { pluralize } from "@/src/utils/text/pluralize";

import BannerCard from "./BannerCard";
import type { BannerVariant } from "./BannerCard";

const PER_COUNT = 50;
const MAX_BANNERS = 4;

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
    match: (n) => n.kind === "appointment_pending_approval",
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
      n.subject?.appointment?.date === today,
    buildTitle: (count) =>
      count === 1 ? "Отмена на сегодня" : `${count} отмены на сегодня`,
    actionLabel: "Открыть",
  },
];

const NotificationBanners = () => {
  const { data } = useGetNotificationsQuery({ per_count: PER_COUNT });

  const banners = useMemo(() => {
    const items = data?.notifications.filter((n) => n.read_at === null) ?? [];
    const today = format(new Date(), "yyyy-MM-dd");

    return NOTIFICATION_BANNERS.map((b) => ({
      ...b,
      count: items.filter((n) => b.match(n, today)).length,
    }))
      .filter((b) => b.count > 0)
      .slice(0, MAX_BANNERS);
  }, [data]);

  if (banners.length === 0) return null;

  const handleOpenList = () => router.push(Routers.app.menu.notifications);

  return (
    <View className="gap-2">
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
