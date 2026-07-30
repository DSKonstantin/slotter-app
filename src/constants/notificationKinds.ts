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
  badge: NotificationBadgeConfig;
  detailRoute?: string;
  /** Open the external subscription/upgrade web page on tap instead of the
   * usual subject-based navigation — for the "money" kinds where the user
   * needs to fix a payment. */
  openUpgrade?: boolean;
};

export const NOTIFICATION_KIND_CONFIG: Record<NotificationKind, KindConfig> = {
  appointment_created: {
    badge: { icon: "Add_round_fill", color: colors.primary.blue[500] },
  },
  appointment_booked: {
    badge: { icon: "Add_round_fill", color: colors.primary.blue[500] },
  },
  appointment_pending_approval: {
    badge: { icon: "Add_round_fill", color: colors.primary.blue[500] },
  },
  appointment_confirmed: {
    badge: { icon: "Check_fill", color: colors.primary.green[700] },
  },
  appointment_cancelled: {
    badge: { icon: "Close_round_fill", color: colors.accent.red[500] },
  },
  appointment_rescheduled: {
    badge: { icon: "Time_fill", color: colors.accent.yellow[700] },
    detailRoute: Routers.app.account.clientNotifications.reschedule,
  },
  appointment_reminder: {
    badge: { icon: "Time_fill", color: colors.primary.blue[500] },
    detailRoute: Routers.app.account.clientNotifications.reminder,
  },
  appointment_requested: {
    badge: { icon: "Add_round_fill", color: colors.primary.blue[500] },
  },
  appointment_request_accepted: {
    badge: { icon: "Check_fill", color: colors.primary.green[500] },
  },
  appointment_customer_accepted: {
    badge: { icon: "Check_fill", color: colors.primary.green[500] },
  },
  appointment_customer_declined: {
    badge: { icon: "Close_round_fill", color: colors.accent.red[500] },
  },
  appointment_reschedule_requested: {
    badge: {
      icon: "Sort_arrow",
      color: colors.neutral[0],
      bgColor: colors.accent.orange[500],
      rotate: 90,
    },
  },
  rebook_suggestion: {
    badge: { icon: "Star_fill", color: colors.accent.yellow[700] },
  },
  rebook_after_cancel: {
    badge: { icon: "Refresh_2_light", color: colors.primary.blue[500] },
  },
  review_request: {
    badge: { icon: "Star_fill", color: colors.accent.orange[500] },
  },
  birthday_greeting: {
    badge: { icon: "gift_alt", color: colors.accent.red[500] },
  },
  referral_signup: {
    badge: { icon: "User_add_alt_fill", color: colors.primary.green[700] },
  },
  chat_new_activity: {
    badge: { icon: "Chat_fill", color: colors.accent.purple[500] },
  },
  subscription_grace: {
    badge: { icon: "Credit-card_fill", color: colors.accent.orange[500] },
    openUpgrade: true,
  },
  subscription_expired: {
    badge: { icon: "Alarm_fill", color: colors.accent.red[500] },
  },
  direct_channel_grace: {
    badge: { icon: "Credit-card_fill", color: colors.accent.orange[500] },
    openUpgrade: true,
  },
  direct_channel_expired: {
    badge: { icon: "Alarm_fill", color: colors.accent.red[500] },
  },
  direct_channel_disconnected: {
    badge: { icon: "link_alt", color: colors.accent.orange[500] },
    detailRoute: Routers.app.account.clientNotifications.root,
  },
};

export const DEFAULT_NOTIFICATION_BADGE: NotificationBadgeConfig = {
  icon: "Clock_fill",
  color: colors.neutral[400],
};
