import type { AudienceFilters } from "./types";

const countActiveFilters = (filters: AudienceFilters | undefined): number => {
  if (!filters) return 0;
  let count = 0;
  if (filters.spentMoreThan != null) count += 1;
  if (filters.avgCheckMoreThan != null) count += 1;
  if (filters.visits?.from != null || filters.visits?.to != null) count += 1;
  if (filters.visitDate) count += 1;
  if (filters.birthDate) count += 1;
  if (filters.categoryIds?.length) count += 1;
  return count;
};

export const summarizeAudienceFilters = (
  filters: AudienceFilters | undefined,
): string => {
  const count = countActiveFilters(filters);
  return count === 0 ? "Все" : `Фильтров: ${count}`;
};
