export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "arrived"
  | "completed"
  | "late"
  | "no_show"
  | "cancelled";

export type PaymentMethod = "cash" | "sbp" | "online_bank";

export interface AppointmentCustomer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  telegram_id: string | null;
  customer_tag: { id: number; name: string; color: string } | null;
  note: string | null;
}

export interface AppointmentService {
  id: number;
  name: string;
  duration: number;
  price_cents: number;
  price_currency: string;
}

export interface Appointment {
  id: number;
  status: AppointmentStatus;
  payment_method: PaymentMethod;
  start_time: string;
  end_time: string;
  duration: number;
  price_cents: number;
  price_currency: string;
  comment: string | null;
  cancel_reason: string | null;
  send_notification: boolean;
  public_token: string;
  date: string;
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
  | Appointment[]
  | Record<string, Appointment[]>;

export type CreateAppointmentPayload = {
  date: string;
  start_time: string;
  customer_id: number;
  service_ids?: number[];
  additional_service_ids?: number[];
  duration?: number;
  price_cents?: number;
  payment_method?: PaymentMethod;
  comment?: string;
  send_notification?: boolean;
};

export type UpdateAppointmentPayload = Partial<{
  comment: string;
  service_ids: number[];
  additional_service_ids: number[];
  duration: number;
  price_cents: number;
  payment_method: PaymentMethod;
  send_notification: boolean;
}>;

export type ReschedulePayload = {
  date: string;
  start_time: string;
  duration?: number;
};

export type CancelPayload = {
  cancel_reason?: string;
};
