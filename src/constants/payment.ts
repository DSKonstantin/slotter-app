import type { PaymentMethod } from "@/src/store/redux/services/api-types";

export const PAYMENT_OPTIONS: {
  key: PaymentMethod;
  label: string;
  comingSoon?: boolean;
}[] = [
  { key: "cash", label: "Наличные" },
  { key: "sbp", label: "СБП" },
  { key: "online_bank", label: "Онлайн-банк", comingSoon: true },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Наличные",
  sbp: "СБП",
  online_bank: "Онлайн-банк",
};
