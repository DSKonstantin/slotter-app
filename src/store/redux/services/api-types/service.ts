export interface ServiceCategory {
  id: number;
  name: string;
  code: string | null;
  color: string | null;
  is_active: boolean;
  position: number;
  created_at?: string;
  services?: Service[];
  activeServicesCount?: number;
}

export type CreateServiceCategoryPayload = {
  name: string;
  is_active: boolean;
  color?: string | null;
};

export type CreateServiceCategoryResponse = {
  service_category: ServiceCategory;
};

export type UpdateServiceCategoryPayload = Partial<{
  name: string;
  color: string;
  position: number;
  is_active: boolean;
}>;

export type ServiceCategoryPositionPayload = {
  id: number;
  position: number;
};

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

  main_photo_url?: string | null;
  additional_photo_first_url?: string | null;
  additional_photo_second_url?: string | null;
  additional_photo_third_url?: string | null;
  additional_photo_fourth_url?: string | null;
  additional_photos_urls?: string[];
  created_at?: string;
  additional_services?: AdditionalService[];
}

export type CreateServicePayload = {
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_active?: boolean;
  is_available_online?: boolean;
  position?: number;
  main_photo?: any;
  additional_photos?: any[];
};

export type UpdateServicePayload = Partial<{
  name: string;
  description: string;
  price: number;
  duration: number;
  is_active: boolean;
  is_available_online: boolean;
  position: number;
  main_photo?: any;
  additional_photos?: any[];
}>;

export interface AdditionalService {
  id: number;
  name: string;
  price_cents: number;
  duration: number;
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
