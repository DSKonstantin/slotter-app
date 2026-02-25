import type { Pagination } from "./common";

export interface WorkingDayBreak {
  id: number;
  working_day_id: number;
  start_at: string;
  end_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkingDay {
  id: number;
  user_id: number;
  day: string;
  start_at: string;
  end_at: string;
  created_at?: string;
  updated_at?: string;
  working_day_breaks?: WorkingDayBreak[];
}

export type WorkingDayBreaksAttributesPayload = {
  id?: number;
  start_at?: string;
  end_at?: string;
  _destroy?: boolean;
};

export type CreateWorkingDayPayload = {
  day: string;
  start_at: string;
  end_at: string;
  working_day_breaks_attributes?: WorkingDayBreaksAttributesPayload[];
};

export type UpdateWorkingDayPayload = Partial<{
  day: string;
  start_at: string;
  end_at: string;
  working_day_breaks_attributes: WorkingDayBreaksAttributesPayload[];
}>;

export type CreateWorkingDayBreakPayload = {
  start_at: string;
  end_at: string;
};

export type UpdateWorkingDayBreakPayload = Partial<{
  start_at: string;
  end_at: string;
}>;

export interface WorkingDaysResponse {
  working_days: WorkingDay[];
  pagination: Pagination;
}

export interface WorkingDayBreaksResponse {
  working_day_breaks: WorkingDayBreak[];
  pagination: Pagination;
}
