import type { DateRange } from "@/src/utils/date/dateRange";

export type AudienceFilters = {
  spentMoreThan?: number;
  avgCheckMoreThan?: number;
  visits?: { from?: number; to?: number };
  visitDate?: DateRange;
  birthDate?: DateRange;
  categoryIds?: string[];
};

export const EMPTY_AUDIENCE_FILTERS: AudienceFilters = {};
