import type {
  Notification,
  AppointmentNotificationSubject,
} from "@/src/store/redux/services/api-types";
import { pluralize } from "@/src/utils/text/pluralize";

export type BannerVariant =
  "info" | "action" | "warning" | "alert" | "error" | "critical";

export type NotificationBannerConfig = {
  key: string;
  variant: BannerVariant;
  iconName: string;
  match: (n: Notification, today: string) => boolean;
  buildTitle: (count: number) => string;
  actionLabel: string;
};

export const NOTIFICATION_BANNERS: NotificationBannerConfig[] = [
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
      `${count} ${pluralize(count, ["запрос на перенос", "запроса на перенос", "запросов на перенос"])}`,
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
      `${count} ${pluralize(count, ["отмена на сегодня", "отмены на сегодня", "отмен на сегодня"])}`,
    actionLabel: "Открыть",
  },
];
