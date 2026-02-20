// src/store/redux/services/api-types/service.ts
// =========================
// SERVICE CATEGORY
// =========================
export interface ServiceCategory {
  id: number;
  name: string;
  code: string | null;
  color: string | null;
  is_active: boolean;
  position: number;
  created_at?: string; // Optional as it's not in the provided JSON
  services?: Service[];
  activeServicesCount?: number; // From previous implementation, might be useful
}

export type CreateServiceCategoryPayload = {
  name: string;
  color: string;
};

export type UpdateServiceCategoryPayload = Partial<{
  name: string;
  color: string;
  position: number;
  is_active: boolean;
}>;

// =========================
// SERVICE
// =========================
export interface Service {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price_cents: number;
  price_currency: string;
  is_active: boolean;
  is_additional: boolean;
  is_available_online: boolean;
  position: number;

  // These fields are kept as optional as they might appear in other views
  main_photo_url?: string | null;
  additional_photos_urls?: string[];
  created_at?: string;
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
