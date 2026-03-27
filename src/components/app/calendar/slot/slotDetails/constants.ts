export { APPOINTMENT_STATUS_CONFIG as STATUS_CONFIG } from "@/src/constants/appointmentStatuses";

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Наличные",
  sbp: "СБП",
  online_bank: "Онлайн-банк",
};

export const EDITABLE_STATUSES = ["pending", "confirmed"] as const;
