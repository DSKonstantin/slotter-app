import type { Pagination } from "./common";

export interface CustomerTag {
  id: number;
  name: string;
  color: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  telegram_id: string | null;
  note: string | null;
  customer_tag: CustomerTag | null;
  created_at: string;
}

export interface CustomerStats {
  total_appointments: number;
  completed_appointments: number;
  total_spent_cents: number;
  total_spent_currency: string;
  last_visit_at: string | null;
}

export interface CustomerStatPoint {
  period: string;
  count: number;
}

export interface CustomerStatsResponse {
  stats: CustomerStats;
  chart: CustomerStatPoint[];
}

export interface CustomerBalancePoint {
  period: string;
  amount_cents: number;
}

export interface CustomerBalanceResponse {
  total_cents: number;
  currency: string;
  chart: CustomerBalancePoint[];
}

export type GetCustomersParams = {
  page?: number;
  per_page?: number;
  query?: string;
  tag_id?: number;
};

export interface GetCustomersResponse {
  customers: Customer[];
  pagination: Pagination;
}

export type CreateCustomerPayload = {
  name: string;
  phone?: string;
  email?: string;
  note?: string;
  customer_tag_id?: number;
};

export type UpdateCustomerPayload = {
  name?: string;
  email?: string;
  note?: string;
};

export type AssignTagPayload = {
  customer_tag_id: number;
};

export type CreateCustomerTagPayload = {
  name: string;
  color: string;
};

export type UpdateCustomerTagPayload = Partial<CreateCustomerTagPayload>;
