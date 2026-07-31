export type SubscriptionPlan = {
  id: number;
  tier: string;
  name: string;
  description: string;
  is_active: boolean;
  position: number;
};

export type SubscriptionPlanPrice = {
  id: number;
  months: number;
  price_cents: number;
  price_currency: string;
  position: number;
  is_active: boolean;
  discount_percents: number | null;
  monthly_price_cents: number;
  subscription_plan: SubscriptionPlan;
};

/** Shape returned by `GET /subscription_plans` — a plan with its nested
 * billing-period prices. Distinct from the `subscription_plan` embedded
 * inside a `SubscriptionPlanPrice`, which has no nested prices of its own. */
export type SubscriptionPlanWithPrices = SubscriptionPlan & {
  subscription_plan_prices: SubscriptionPlanPrice[];
};

export type SubscriptionPaymentMethodType =
  | "bank_card"
  | "sbp"
  | "sberbank"
  | "sberpay";

export type SubscriptionPaymentMethod = {
  id: number;
  method_type: SubscriptionPaymentMethodType | null;
  card_last4: string | null;
  card_brand: string | null;
  card_expiry_month: string | null;
  card_expiry_year: string | null;
  provider: string;
  created_at: string;
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
  subscription_plan_price: SubscriptionPlanPrice | null;
  latest_payment_method: SubscriptionPaymentMethod | null;
};

export type CheckoutResponse = {
  confirmation_url: string | null;
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

export type SubscriptionPaymentKind = "initial" | "renewal" | "grace_retry";

export type SubscriptionPayment = {
  id: number;
  status: SubscriptionPaymentStatus;
  kind: SubscriptionPaymentKind;
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
