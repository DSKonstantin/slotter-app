import React from "react";
import { Badge } from "@/src/components/ui";
import type { AppointmentStatus } from "@/src/store/redux/services/api-types";

const STATUS_MAP: Record<
  AppointmentStatus,
  {
    label: string;
    variant:
      | "primary"
      | "success"
      | "warning"
      | "accent"
      | "tertiary"
      | "info"
      | "secondary";
  }
> = {
  pending: { label: "Ожидание", variant: "warning" },
  confirmed: { label: "Подтверждена", variant: "info" },
  arrived: { label: "Пришёл", variant: "accent" },
  completed: { label: "Завершена", variant: "success" },
  late: { label: "Опоздал", variant: "warning" },
  no_show: { label: "Не пришёл", variant: "tertiary" },
  cancelled: { label: "Отменена", variant: "primary" },
};

type Props = { status: AppointmentStatus };

const AppointmentStatusBadge = ({ status }: Props) => {
  const { label, variant } = STATUS_MAP[status] ?? {
    label: status,
    variant: "secondary" as const,
  };
  return <Badge title={label} variant={variant} size="sm" />;
};

export default AppointmentStatusBadge;
