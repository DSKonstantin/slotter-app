import type { Pagination } from "./common";

export type NotificationKind =
  | "appointment_created"
  | "appointment_booked"
  | "appointment_pending_approval"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "appointment_reminder"
  | "appointment_requested"
  | "appointment_request_sent"
  | "appointment_request_accepted"
  | "appointment_customer_accepted"
  | "appointment_customer_declined"
  | "appointment_reschedule_requested"
  | "rebook_suggestion"
  | "rebook_after_cancel"
  | "review_request"
  | "birthday_greeting"
  | "referral_signup"
  | "chat_new_activity"
  | "subscription_grace"
  | "subscription_expired"
  | "direct_channel_grace"
  | "direct_channel_expired"
  | "reactivation_profile_1"
  | "direct_channel_disconnected"
  | "customer_delivery_failed";

export type NotificationCancelVariant =
  "with_reason" | "without_reason" | "by_customer";

export interface NotificationPayload {
  old_date?: string;
  old_time?: string;
  cancel_reason?: string;
  reschedule_comment?: string;
  cancel_variant?: NotificationCancelVariant;
}

export interface NotificationSubjectCustomer {
  id: number;
  name: string;
  avatar_url: string | null;
  avatar_blurhash: string | null;
}

export interface NotificationSubjectInterlocutor {
  id: number;
  type: string;
  name: string;
  avatar_url: string | null;
  avatar_blurhash: string | null;
}

export interface NotificationSubjectUser {
  id: number;
  first_name: string;
  last_name: string;
  profession: string | null;
  nickname: string;
  avatar_url: string | null;
  avatar_blurhash: string | null;
}

export interface AppointmentNotificationSubject {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  customer: NotificationSubjectCustomer;
  user: NotificationSubjectUser;
}

export interface ChatNotificationSubject {
  id: number;
  interlocutor: NotificationSubjectInterlocutor;
  unread_count: number;
  last_activity_at: string;
  last_message: string | null;
  last_read_at: string | null;
  created_at: string;
}

export type NotificationSubject =
  AppointmentNotificationSubject | ChatNotificationSubject;

export interface Notification {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
  payload: NotificationPayload | null;
  subject: NotificationSubject | null;
}

export interface GetNotificationsParams {
  per_count?: number;
  page?: number;
  is_read?: boolean;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  unread_count: number;
  pagination: Pagination;
}

export interface MarkNotificationReadResponse {
  notification: Notification;
}

export interface MarkAllNotificationsReadResponse {
  unread_count: number;
}

export interface NotificationSetting {
  kind: NotificationKind;
  enabled: boolean;
  title: string;
}

export interface NotificationSettingsCustomerGroup {
  stage: string;
  title: string;
  items: NotificationSetting[];
}

export interface GetNotificationSettingsResponse {
  self: NotificationSetting[];
  customer: NotificationSettingsCustomerGroup[];
}

export interface UpdateNotificationSettingsPayload {
  userId: number;
  self?: Partial<Record<NotificationKind, boolean>>;
  customer?: Partial<Record<NotificationKind, boolean>>;
}

export interface NotificationStatsByChannel {
  channel: string;
  sent: number;
  delivered: number;
  failed: number;
}

export interface NotificationStatsTotals {
  sent: number;
  delivered: number;
  failed: number;
}

export interface NotificationStatsResponse {
  notification_stats: {
    period: { from: string; to: string };
    by_channel: NotificationStatsByChannel[];
    totals: NotificationStatsTotals;
  };
}

export interface GetNotificationStatsParams {
  userId: number;
  from: string;
  to: string;
}

export type NotificationTemplateKind = Extract<
  NotificationKind,
  | "appointment_booked"
  | "appointment_request_sent"
  | "appointment_reminder"
  | "appointment_rescheduled"
  | "appointment_cancelled"
  | "rebook_suggestion"
>;

export type NotificationTemplateStage = "booking" | "before" | "retention";

export type TemplateChannel = "auto" | "telegram_direct" | "max_direct";

export interface NotificationTemplateRow {
  kind: NotificationTemplateKind;
  title: string;
  switch_title: string;
  description: string;
  stage: NotificationTemplateStage;
  enabled: boolean;
  is_custom: boolean;
  channel: TemplateChannel | null;
  body: string | null;
  default_body: string;
  preview: string;
}

export interface TemplateVariable {
  key: string;
  title: string;
  example: string;
}

export interface NotificationTemplate {
  id: number;
  kind: NotificationTemplateKind;
  channel: TemplateChannel;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface GetNotificationTemplatesResponse {
  notification_templates: NotificationTemplateRow[];
}

export interface GetNotificationTemplateVariablesResponse {
  notification_template_variables: TemplateVariable[];
}

export interface SaveNotificationTemplatePayload {
  userId: number;
  kind: NotificationTemplateKind;
  channel: TemplateChannel;
  body: string;
}

export interface SaveNotificationTemplateResponse {
  notification_template: NotificationTemplate;
}

export interface PreviewNotificationTemplatePayload {
  userId: number;
  kind: NotificationTemplateKind;
  body: string;
}

export interface PreviewNotificationTemplateResponse {
  preview: { text: string; length: number };
}

export interface ResetNotificationTemplateResponse {
  notification_template: NotificationTemplateRow;
}
