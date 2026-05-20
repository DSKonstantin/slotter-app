export type SubscriptionPlan = {
  id: number;
  name: string;
  months: number;
  price_cents: number;
  monthly_price_cents: number;
  price_currency: string;
  position: number;
  is_active: boolean;
};

export type SubscriptionStatus = "active" | "grace" | "cancelled" | "expired";

export type SubscriptionMembership = {
  id: number;
  plan: "free" | "pro";
  status: SubscriptionStatus;
  billing_period_months: number | null;
  period_starts_at: string | null;
  period_ends_at: string | null;
  cancelled_at: string | null;
  grace_retry_count: number;
  pro_access: boolean;
  subscription_plan: SubscriptionPlan | null;
};

export type CheckoutResponse = {
  confirmation_url: string;
  payment_id: number;
};

export type SubscriptionQuota = {
  used: number;
  limit: number;
  resets_at: string;
  plan: "free" | "pro";
};
