export enum UserType {
  USER = "user",
  CUSTOM = "custom",
}

export namespace API {
  export type BaseResponse = {
    httpStatus: 200;
    created_at: string;
  };

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

  // =========================
  // SERVICE CATEGORY
  // =========================

  export interface ServiceCategory {
    id: number;
    name: string;
    color: string;
    position: number;
    created_at: string;

    services?: Service[];
  }

  export type CreateServiceCategoryPayload = {
    name: string;
    color: string;
  };

  export type UpdateServiceCategoryPayload = Partial<{
    name: string;
    color: string;
    position: number;
  }>;

  // =========================
  // SERVICE
  // =========================

  export interface Service {
    id: number;

    name: string;

    price: number;
    duration: number;

    is_active: boolean;

    main_photo_url?: string | null;
    additional_photos_urls?: string[];

    position: number;

    created_at: string;

    additional_services?: AdditionalService[];
  }

  export type CreateServicePayload = {
    name: string;
    price: number;
    duration: number;

    is_active?: boolean;
    position?: number;

    main_photo?: any;
    additional_photos?: any[];
  };

  export type UpdateServicePayload = Partial<{
    name: string;
    price: number;
    duration: number;

    is_active: boolean;
    position: number;

    main_photo?: any;
    additional_photos?: any[];
  }>;

  // =========================
  // ADDITIONAL SERVICE
  // =========================

  export interface AdditionalService {
    id: number;

    name: string;
    price: number;

    position?: number;

    created_at: string;
  }

  export type CreateAdditionalServicePayload = {
    name: string;
    price: number;
    position?: number;
  };

  export type UpdateAdditionalServicePayload = Partial<{
    name: string;
    price: number;
    position: number;
  }>;
}
