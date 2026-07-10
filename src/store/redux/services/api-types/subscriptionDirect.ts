export type DirectChannelKind = "telegram_direct" | "max_direct";

export type DirectChannelStatus =
  | "pending"
  | "paid"
  | "active"
  | "grace"
  | "cancelled"
  | "expired";

export type DirectChannelProvisioningStatus =
  | "none"
  | "company_created"
  | "topped_up"
  | "connecting"
  | "awaiting_auth"
  | "active";

export type SubscriptionDirectPlan = {
  id: number;
  kind: DirectChannelKind;
  price_cents: number;
  price_currency: string;
  is_active: boolean;
};

export type SubscriptionDirectChannel = {
  id: number;
  kind: DirectChannelKind;
  status: DirectChannelStatus;
  provisioning_status: DirectChannelProvisioningStatus;
  period_ends_at: string | null;
  is_auto_renew: boolean;
  price_cents: number;
  price_currency: string;
};

export type GetSubscriptionDirectChannelsResponse = {
  subscription_direct_channels: SubscriptionDirectChannel[];
};

export type DirectChannelCheckoutResponse = {
  confirmation_url: string;
  payment_id: number;
};

export type DirectChannelAuthStartResponse = {
  status?: "code_sent";
  qr?: string;
};

export type DirectChannelAuthCodeResponse = {
  ok: boolean;
  needs_password: boolean;
};

export type DirectChannelAuthPasswordResponse = {
  ok: boolean;
};

export type DirectChannelAuthStatus = "provisioning" | "connected";

export type DirectChannelAuthStatusResponse = {
  auth_status: DirectChannelAuthStatus;
  subscription_direct_channel: SubscriptionDirectChannel;
};
