export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Наличные",
  sbp: "СБП",
  online_bank: "Онлайн-банк",
};

export const EDITABLE_STATUSES = ["pending", "confirmed"] as const;

export const STATUS_CONFIG = {
  pending: { label: "Ожидает", variant: "warning" as const },
  confirmed: { label: "Подтверждено", variant: "success" as const },
  arrived: { label: "Пришёл", variant: "success" as const },
  late: { label: "Опоздал", variant: "warning" as const },
  completed: { label: "Завершено", variant: "success" as const },
  no_show: { label: "Не явился", variant: "info" as const },
  cancelled: { label: "Отменено", variant: "info" as const },
};
