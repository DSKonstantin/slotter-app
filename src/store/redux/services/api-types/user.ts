// src/store/redux/services/api-types/user.ts
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
  personal_link: string | null;
  profession: string | null;
  experience: string | null;
  avatar_url: string | null;
  is_home_work: boolean;
  is_online_work: boolean;
  is_out_call: boolean;
  phone_confirmed_at: string | null;
  telegram_id: number | null;
  onboarding_step: string;
  is_auto_approve: boolean;
  appointment_step: AppointmentStep;
  is_notify_booking: boolean;
  is_notify_cancellation: boolean;
  is_notify_reminder: boolean;
}

export interface AuthResponse {
  token: string;
  resource: User;
}

export interface TelegramRegisterResponse {
  uuid: string;
  telegram_link: string;
  expires_in: number;
}

export interface TelegramRegisterStatusResponse extends AuthResponse {
  status: "pending" | "confirmed";
}

export interface TelegramLoginResponse extends AuthResponse {}

export interface MeResponse {
  status: "authorized" | "unauthorized";
  resource_type: "user" | "customer";
  resource: User;
}

export type UpdateUserPayload = Partial<
  Omit<User, "id" | "phone" | "phone_confirmed_at" | "telegram_id">
> & {
  password?: string;
};
