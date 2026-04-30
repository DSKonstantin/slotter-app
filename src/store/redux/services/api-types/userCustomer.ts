import type { Pagination } from "./common";
import type { Appointment, AppointmentStatus } from "./appointment";
import type { CustomerTag } from "./customer";

export interface UserCustomerPerson {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  birthday?: string | null;
}

export interface UserCustomerStats {
  visits_count: number;
  total_spent_cents: number;
  avg_check_cents: number;
  last_visit_at: string | null;
  next_appointment_at: string | null;
  display_date: string | null;
}

export interface UserCustomer {
  id: number;
  customer: UserCustomerPerson;
  customer_tag: CustomerTag | null;
  note: string | null;
  stats: UserCustomerStats;
}

export type UserCustomerSort =
  | "name_asc"
  | "last_visit_desc"
  | "next_appointment_asc";

export type GetUserCustomersParams = {
  query?: string;
  customer_tag_id?: number;
  sort?: UserCustomerSort;
  per_count?: number;
  page?: number;
};

export interface GetUserCustomersResponse {
  user_customers: UserCustomer[];
  pagination: Pagination;
}

export interface GetUserCustomerResponse {
  user_customer: UserCustomer;
}

export type CreateUserCustomerPayload = {
  customer: {
    name?: string;
    phone: string;
    email?: string;
  };
  customer_tag_id?: number | null;
  note?: string;
};

export type UpdateUserCustomerPayload = {
  customer_tag_id?: number | null;
  note?: string;
};

export type UserCustomerPeriod =
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "custom";

export type GetUserCustomerAppointmentsParams = {
  period?: UserCustomerPeriod;
  date_from?: string;
  date_to?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  sort?: "asc";
  per_count?: number;
  page?: number;
};

export interface GetUserCustomerAppointmentsResponse {
  appointments: Appointment[];
  pagination: Pagination;
}

export type GetUserCustomerFinancesParams = {
  period?: UserCustomerPeriod;
  date_from?: string;
  date_to?: string;
};

export interface UserCustomerFinancesPayment {
  appointment_id: number;
  amount_cents: number;
  date: string;
}

export interface UserCustomerFinancesChartPoint {
  month: string;
  amount_cents: number;
}

export interface GetUserCustomerFinancesResponse {
  total_income_cents: number;
  visits_count: number;
  payments: UserCustomerFinancesPayment[];
  chart: UserCustomerFinancesChartPoint[];
}

export type GetUserCustomersStatisticsParams = {
  period?: UserCustomerPeriod;
  date_from?: string;
  date_to?: string;
};

export interface UserCustomersStatisticDelta {
  count: number;
  delta_percent: number | null;
}

export interface UserCustomersStatisticAvgCheck {
  amount_cents: number;
  delta_percent: number | null;
}

export interface GetUserCustomersStatisticsResponse {
  new_clients: UserCustomersStatisticDelta;
  returned_clients: UserCustomersStatisticDelta;
  lost_clients: UserCustomersStatisticDelta;
  avg_check: UserCustomersStatisticAvgCheck;
}
