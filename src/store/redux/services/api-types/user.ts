import type { GalleryPhoto } from "./galleryPhoto";
import type { SubscriptionMembership } from "./subscription";

export type AppointmentStep =
  | "five_minutes"
  | "ten_minutes"
  | "fifteen_minutes"
  | "thirty_minutes"
  | "one_hour"
  | "two_hours"
  | "three_hours"
  | "four_hours";

export type BookingFixedTimeInterval =
  | "five_minutes"
  | "ten_minutes"
  | "fifteen_minutes"
  | "thirty_minutes"
  | "one_hour"
  | "two_hours"
  | "three_hours"
  | "four_hours";

export type BookingFixedTimeDay =
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface BookingFixedTimeApi {
  enabled: boolean;
  mode: "fixed" | "weekly";
  interval: BookingFixedTimeInterval;
  fixed_times: string[];
  days: BookingFixedTimeDay[];
  day_times: Partial<Record<BookingFixedTimeDay, string[]>>;
}

export enum UserType {
  USER = "user",
  CUSTOM = "custom",
}

export interface User {
  id: number;
  phone: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  about_me: string | null;
  address: string | null;
  nickname: string | null;
  profession: string | null;
  experience: string | null;
  avatar_url: string | null;
  avatar_blurhash: string | null;
  is_home_work: boolean;
  is_online_work: boolean;
  is_out_call: boolean;
  phone_confirmed_at: string | null;
  telegram_id: number | null;
  onboarding_step: string;
  appointment_step: AppointmentStep;
  booking_fixed_time?: BookingFixedTimeApi;
  appointment_conditions: string | null;
  is_notify_new_appointment: boolean;
  is_notify_customer_cancel: boolean;
  is_notify_reminders: boolean;
  is_personal_data_consent_enabled: boolean;
  personal_data_consent_text: string | null;
  is_marketing_consent_enabled: boolean;
  rebook_days_count: number;
  personal_data_consent_template?: string;
  gallery_photos: GalleryPhoto[];
  subscription_membership?: SubscriptionMembership;
}

export interface AuthResponse {
  status: string;
  token: string;
  resource_type: "user" | "customer";
  resource: User;
  is_created?: boolean;
}

export type SendCodeMethod = "flashcall" | "callback" | "telegram";
export type ConfirmCodeMethod = "telegram";

export interface SendCodeResponse {
  status: "verification_started";
  method: SendCodeMethod;
  call_phone: string | null;
  bot_url?: string;
  is_code_sent?: boolean;
  code_length: number | null;
  expires_in: number;
  resend_after: number;
  is_poll: boolean;
  poll_interval: number;
}

export interface ResetPasswordAuthorizedResponse {
  status: "authorized";
  token: string;
  resource_type: "user";
  resource: User;
}

export interface ResetPasswordWrongCodeResponse {
  status: "wrong_code";
  attempts_left: number;
}

export interface ResetPasswordOtherResponse {
  status: "pending" | "expired";
}

export type ResetPasswordResponse =
  | ResetPasswordAuthorizedResponse
  | ResetPasswordWrongCodeResponse
  | ResetPasswordOtherResponse;

export interface ConfirmCodeAuthorizedResponse {
  status: "authorized";
  token: string;
  resource_type: "user" | "customer";
  resource: User;
  is_created: boolean;
  is_referral_applied: boolean;
  referral_error: string | null;
}

export interface ConfirmCodeWrongCodeResponse {
  status: "wrong_code";
  attempts_left: number;
}

export interface ConfirmCodeOtherResponse {
  status: "pending" | "expired" | "deactivated";
}

export type ConfirmCodeResponse =
  | ConfirmCodeAuthorizedResponse
  | ConfirmCodeWrongCodeResponse
  | ConfirmCodeOtherResponse;

export interface MeResponse {
  status: "authorized" | "unauthorized";
  resource_type: "user" | "customer";
  resource: User;
}

export interface UpdateCredentialsPayload {
  email?: string;
  password?: string;
  password_confirmation?: string;
  current_password?: string;
  onboarding_step?: string;
}

export type UpdateUserPayload = Partial<
  Omit<User, "id" | "phone" | "phone_confirmed_at" | "telegram_id">
> & {
  password?: string;
};
