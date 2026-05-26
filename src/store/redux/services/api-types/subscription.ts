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

export type SubscriptionPaymentMethod = {
  id: number;
  card_last4: string | null;
  card_brand: string | null;
  card_expiry_month: string | null;
  card_expiry_year: string | null;
  is_default: boolean;
  saved_at: string;
  last_used_at: string | null;
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
  is_auto_renew: boolean;
  pro_access: boolean;
  subscription_plan: SubscriptionPlan | null;
  default_payment_method: SubscriptionPaymentMethod | null;
};

export type CheckoutResponse = {
  confirmation_url: string;
  payment_id: number;
};

export type RenewWithCardResponse = {
  payment_id: number;
  confirmation_url: string | null;
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
