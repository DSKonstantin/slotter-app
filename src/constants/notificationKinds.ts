import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import type { NotificationKind } from "@/src/store/redux/services/api-types";

export type NotificationBadgeConfig = {
  icon: string;
  color: string;
  bgColor?: string;
  rotate?: number;
};

type KindConfig = {
  title: string;
  badge: NotificationBadgeConfig;
  detailRoute?: string;
};

export const NOTIFICATION_KIND_CONFIG: Record<NotificationKind, KindConfig> = {
  appointment_created: {
    title: "Новая запись",
    badge: { icon: "Add_round_fill", color: colors.primary.blue[500] },
  },
  appointment_booked: {
    title: "Запись создана",
    badge: { icon: "Add_round_fill", color: colors.primary.blue[500] },
  },
  appointment_pending_approval: {
    title: "Запись на подтверждение",
    badge: { icon: "Add_round_fill", color: colors.primary.blue[500] },
  },
  appointment_confirmed: {
    title: "Запись подтверждена",
    badge: { icon: "Check_fill", color: colors.primary.green[700] },
  },
  appointment_cancelled: {
    title: "Отмена записи",
    badge: { icon: "Close_round_fill", color: colors.accent.red[500] },
  },
  appointment_rescheduled: {
    title: "Перенос записи",
    badge: { icon: "Time_fill", color: colors.accent.yellow[700] },
    detailRoute: Routers.app.account.clientNotifications.reschedule,
  },
  appointment_reminder: {
    title: "Напоминание о визите",
    badge: { icon: "Time_fill", color: colors.primary.blue[500] },
    detailRoute: Routers.app.account.clientNotifications.reminder,
  },
  appointment_requested: {
    title: "Запрос на запись",
    badge: { icon: "Add_round_fill", color: colors.primary.blue[500] },
  },
  appointment_request_accepted: {
    title: "Запрос принят",
    badge: { icon: "Check_fill", color: colors.primary.green[500] },
  },
  appointment_customer_accepted: {
    title: "Клиент подтвердил",
    badge: { icon: "Check_fill", color: colors.primary.green[500] },
  },
  appointment_customer_declined: {
    title: "Клиент отказался",
    badge: { icon: "Close_round_fill", color: colors.accent.red[500] },
  },
  appointment_reschedule_requested: {
    title: "Перенос записи",
    badge: {
      icon: "Sort_arrow",
      color: colors.neutral[0],
      bgColor: colors.accent.orange[500],
      rotate: 90,
    },
    detailRoute: Routers.app.account.clientNotifications.reschedule,
  },
  rebook_suggestion: {
    title: "Повторный визит",
    badge: { icon: "Star_fill", color: colors.accent.yellow[700] },
  },
  rebook_after_cancel: {
    title: "Приглашение после отмены",
    badge: { icon: "Refresh_2_light", color: colors.primary.blue[500] },
  },
  review_request: {
    title: "Запрос отзыва",
    badge: { icon: "Star_fill", color: colors.accent.orange[500] },
  },
  birthday_greeting: {
    title: "День рождения",
    badge: { icon: "gift_alt", color: colors.accent.red[500] },
  },
  referral_signup: {
    title: "Регистрация по реферальной ссылке",
    badge: { icon: "User_add_alt_fill", color: colors.primary.green[700] },
  },
  chat_new_activity: {
    title: "Новые сообщения в чате",
    badge: { icon: "Chat_fill", color: colors.accent.purple[500] },
  },
};

export const DEFAULT_NOTIFICATION_BADGE: NotificationBadgeConfig = {
  icon: "Clock_fill",
  color: colors.neutral[400],
};

export const NOTIFICATION_SECTIONS: {
  section: string;
  kinds: NotificationKind[];
}[] = [
  {
    section: "При записи",
    kinds: [
      "appointment_created",
      "appointment_requested",
      "appointment_pending_approval",
      "appointment_customer_accepted",
      "appointment_customer_declined",
    ],
  },
  {
    section: "Перед визитом",
    kinds: [
      "appointment_reminder",
      "appointment_reschedule_requested",
      "chat_new_activity",
      "appointment_cancelled",
    ],
  },
  {
    section: "После визита",
    kinds: ["review_request"],
  },
  {
    section: "Возвращаемость",
    kinds: ["rebook_suggestion", "birthday_greeting", "rebook_after_cancel"],
  },
];
