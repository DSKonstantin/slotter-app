import type { Pagination } from "./common";

export type NotificationKind =
  | "appointment_created"
  | "appointment_pending_approval"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "appointment_reminder"
  | "appointment_customer_confirmed"
  | "appointment_customer_accepted"
  | "appointment_customer_declined"
  | "appointment_reschedule_requested"
  | "rebook_suggestion"
  | "chat_new_activity";

export type NotificationCancelVariant =
  | "with_reason"
  | "without_reason"
  | "by_customer";

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
  customer_confirmed_at: string | null;
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
  | AppointmentNotificationSubject
  | ChatNotificationSubject;

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
