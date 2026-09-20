import type { Pagination } from "./common";
import type { DirectChannelKind } from "./subscriptionDirect";

export type BroadcastStatus =
  "preparing" | "scheduled" | "running" | "paused" | "completed" | "cancelled";

export type BroadcastStopReason =
  "channel_inactive" | "no_active_channel" | "empty_audience" | null;

export interface BroadcastStats {
  recipients_count: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
}

export interface ApiAudienceFilters {
  customer_tag_ids?: number[];
  birthday_from?: string;
  birthday_to?: string;
  visits_count_min?: number;
  visits_count_max?: number;
  total_spent_cents_min?: number;
  avg_check_cents_min?: number;
  last_visit_from?: string;
  last_visit_to?: string;
}

export interface MarketingBroadcast {
  id: number;
  name: string;
  body: string;
  status: BroadcastStatus;
  channel_kind: DirectChannelKind;
  scheduled_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  stop_reason: BroadcastStopReason;
  is_marketing_consent_required: boolean;
  audience_filters: ApiAudienceFilters;
  stats: BroadcastStats;
}

export interface GetMarketingBroadcastsParams {
  status?: string;
  query?: string;
  per_count?: number;
}

export interface GetMarketingBroadcastsResponse {
  marketing_broadcasts: MarketingBroadcast[];
  pagination: Pagination;
}

export interface GetMarketingBroadcastResponse {
  marketing_broadcast: MarketingBroadcast;
}

export interface CreateMarketingBroadcastPayload {
  name: string;
  body: string;
  channel_kind: DirectChannelKind;
  scheduled_at?: string;
  is_marketing_consent_required?: boolean;
  audience_filters?: ApiAudienceFilters;
}

export interface AudienceCount {
  matched_count: number;
  with_consent_count: number;
  recipients_count: number;
}

export interface GetMarketingBroadcastAudienceResponse {
  audience: AudienceCount;
}

export interface GetMarketingBroadcastAudiencePayload {
  is_marketing_consent_required: boolean;
  audience_filters: ApiAudienceFilters;
}

export type ValidationErrors = { errors: Record<string, string[]> };
