import { rublesToCents } from "@/src/utils/price/formatPrice";
import type { ApiAudienceFilters } from "@/src/store/redux/services/api-types";
import type { AudienceFilters } from "./audienceFilter/types";

export const mapAudienceFilters = (
  filters: AudienceFilters | undefined,
): ApiAudienceFilters => {
  if (!filters) return {};

  const result: ApiAudienceFilters = {};

  if (filters.categoryIds?.length) {
    result.customer_tag_ids = filters.categoryIds.map(Number);
  }
  if (filters.birthDate?.from) result.birthday_from = filters.birthDate.from;
  if (filters.birthDate?.to) result.birthday_to = filters.birthDate.to;
  if (filters.visits?.from != null)
    result.visits_count_min = filters.visits.from;
  if (filters.visits?.to != null) result.visits_count_max = filters.visits.to;
  if (filters.spentMoreThan != null)
    result.total_spent_cents_min = rublesToCents(filters.spentMoreThan);
  if (filters.avgCheckMoreThan != null)
    result.avg_check_cents_min = rublesToCents(filters.avgCheckMoreThan);
  if (filters.visitDate?.from) result.last_visit_from = filters.visitDate.from;
  if (filters.visitDate?.to) result.last_visit_to = filters.visitDate.to;

  return result;
};
