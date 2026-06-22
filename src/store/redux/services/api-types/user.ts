// src/store/redux/services/api-types/user.ts
import type { GalleryPhoto } from "./galleryPhoto";
import type { SubscriptionMembership } from "./subscription";

export type AppointmentStep =
  | "five_minutes"
  | "ten_minutes"
  | "fifteen_minutes"
  | "thirty_minutes"
  | "one_hour";

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
  is_auto_approve: boolean;
  appointment_step: AppointmentStep;
  is_notify_new_appointment: boolean;
  is_notify_customer_cancel: boolean;
  is_notify_reminders: boolean;
  gallery_photos: GalleryPhoto[];
  subscription_membership: SubscriptionMembership;
}

export interface AuthResponse {
  status: string;
  token: string;
  resource_type: "user" | "customer";
  resource: User;
  is_created?: boolean;
}

export interface SendCodeResponse {
  status: "verification_started";
  method: "flashcall" | "callback";
  call_phone: string | null;
  code_length: number | null;
  expires_in: number;
  resend_after: number;
  is_poll: boolean;
  poll_interval: number;
}

// reset_password always returns 200 — discriminate by status
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

// confirm_code always returns 200 — discriminate by status
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

// telegram_intents
export interface TelegramIntentResponse {
  url: string;
  code: string;
  expires_in: number;
  poll_interval: number;
}

// telegram_sessions — always 200, discriminate by status
export interface TelegramSessionAuthorizedResponse {
  status: "authorized";
  token: string;
  resource_type: "user" | "customer";
  resource: User;
  is_created: boolean;
}

export interface TelegramSessionOtherResponse {
  status: "pending" | "awaiting_contact" | "consumed" | "expired" | "deactivated";
}

export type TelegramSessionResponse =
  | TelegramSessionAuthorizedResponse
  | TelegramSessionOtherResponse;

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
