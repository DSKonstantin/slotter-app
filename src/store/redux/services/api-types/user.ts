// src/store/redux/services/api-types/user.ts
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
  is_home_work: boolean;
  is_online_work: boolean;
  is_out_call: boolean;
  phone_confirmed_at: string | null;
  telegram_id: number | null;
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
