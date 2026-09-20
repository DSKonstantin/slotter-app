export type AppointmentStatus =
  | "requested"
  | "pending"
  | "confirmed"
  | "arrived"
  | "completed"
  | "delayed"
  | "missed"
  | "cancelled";

export type PaymentMethod = "cash" | "sbp" | "online_bank";

/** State of the "you're booked" message sent to the customer when the
 * appointment was created — only present on `GET /appointments/:id`, not
 * on the calendar list endpoints. `null` also covers an over-quota
 * appointment on a non-Pro plan, whose other details are hidden too. */
export type CustomerNotificationState =
  "not_requested" | "not_sent" | "sending" | "delivered" | "failed";

export interface AppointmentCustomer {
  id: number | null;
  name: string;
  phone: string;
  email: string | null;
  telegram_id: string | null;
  avatar_url: string | null;
  avatar_blurhash: string | null;
  customer_tag: { id: number; name: string; color: string } | null;
  note: string | null;
}

export interface AppointmentService {
  id: number;
  name: string;
  duration: number;
  price_cents: number;
  price_currency: string;
  main_photo_url?: string | null;
  main_photo_blurhash?: string | null;
}

export interface Appointment {
  id: number;
  status: AppointmentStatus;
  payment_method: PaymentMethod | null;
  start_time: string;
  end_time: string;
  duration: number;
  price_cents: number | null;
  price_currency: string;
  comment: string | null;
  cancel_reason: string | null;
  send_notification: boolean;
  break_after_minutes: number;
  public_token?: string;
  date: string;
  /** Only set on `GET /appointments/:id` — absent from the calendar list
   * endpoints. */
  customer_notification_state?: CustomerNotificationState | null;
  customer: AppointmentCustomer;
  services: AppointmentService[];
  additional_services: AppointmentService[];
}

export type GetAppointmentsParams = {
  date?: string;
  date_from?: string;
  date_to?: string;
  status?: AppointmentStatus[];
};

export type GetAppointmentsResponse =
  Appointment[] | Record<string, Appointment[]>;

export interface UpcomingAppointmentCustomer {
  id: number;
  name: string;
  avatar_url: string | null;
  avatar_blurhash: string | null;
}

export interface UpcomingAppointment {
  id: number;
  status: AppointmentStatus;
  payment_method: PaymentMethod | null;
  start_time: string;
  end_time: string;
  duration: number;
  price_cents: number | null;
  price_currency: string;
  comment: string | null;
  cancel_reason: string | null;
  send_notification: boolean;
  public_token?: string;
  date: string;
  customer: UpcomingAppointmentCustomer;
  services: AppointmentService[];
  additional_services: AppointmentService[];
}

export interface GetUpcomingAppointmentsResponse {
  appointments: UpcomingAppointment[];
}

export type CreateAppointmentPayload = {
  date: string;
  start_time: string;
  customer_id?: number;
  service_ids?: number[];
  additional_service_ids?: number[];
  duration?: number;
  price_cents?: number;
  payment_method?: PaymentMethod;
  comment?: string;
  send_notification?: boolean;
  break_after_minutes?: number;
};

export type UpdateAppointmentPayload = Partial<{
  comment: string;
  service_ids: number[];
  additional_service_ids: number[];
  duration: number;
  price_cents: number;
  payment_method: PaymentMethod;
  send_notification: boolean;
  break_after_minutes: number;
}>;

export type ReschedulePayload = {
  date: string;
  start_time: string;
  duration?: number;
};

export type CancelPayload = {
  cancel_reason?: string;
};
