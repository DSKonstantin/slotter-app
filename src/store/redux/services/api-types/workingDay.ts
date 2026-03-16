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
  is_active: boolean;
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
  is_active: boolean;
  working_day_breaks_attributes?: WorkingDayBreaksAttributesPayload[];
};

export type BulkCreateWorkingDayItem = {
  day: string;
  start_at: string;
  end_at: string;
  working_day_breaks?: { start_at: string; end_at: string }[];
};

export type BulkCreateWorkingDaysPayload = {
  userId: number;
  working_days: BulkCreateWorkingDayItem[];
};

export type UpdateWorkingDayPayload = Partial<{
  day: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
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

export type WorkingDaysResponse = Record<string, WorkingDay | null>;

export interface WorkingDayBreaksResponse {
  working_day_breaks: WorkingDayBreak[];
}
