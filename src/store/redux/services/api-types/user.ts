// src/store/redux/services/api-types/user.ts
import type { GalleryPhoto } from "./galleryPhoto";

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
}

export interface AuthResponse {
  status: string;
  token: string;
  resource_type: "user" | "customer";
  resource: User;
}

export interface SendCodeResponse {
  status: "code_sent";
  expires_in: number;
}

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
}

export type UpdateUserPayload = Partial<
  Omit<User, "id" | "phone" | "phone_confirmed_at" | "telegram_id">
> & {
  password?: string;
};
