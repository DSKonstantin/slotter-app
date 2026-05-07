import type { Pagination } from "./common";
import type { Appointment } from "./appointment";

export type NotificationKind =
  | "appointment_created"
  | "appointment_pending_approval"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "appointment_reminder"
  | "appointment_customer_confirmed"
  | "appointment_reschedule_requested"
  | "rebook_suggestion";

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

export interface NotificationSubject {
  type: "Appointment";
  appointment: Appointment | null;
}

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
