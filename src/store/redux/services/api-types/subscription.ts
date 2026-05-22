export type SubscriptionPlan = {
  id: number;
  name: string;
  months: number;
  price_cents: number;
  monthly_price_cents: number;
  price_currency: string;
  position: number;
  is_active: boolean;
  discount_percent: number;
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

export type SubscriptionPaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded";

export type SubscriptionPayment = {
  id: number;
  status: SubscriptionPaymentStatus;
  payment_type: "initial" | "renewal" | "grace_retry";
  amount_cents: number;
  amount_currency: string;
  created_at: string;
};

export type SubscriptionQuota = {
  used: number;
  limit: number;
  resets_at: string;
  plan: "free" | "pro";
};
