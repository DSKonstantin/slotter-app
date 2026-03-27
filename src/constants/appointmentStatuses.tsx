import React from "react";

import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { AppointmentStatus } from "@/src/store/redux/services/api-types/appointment";

export type AppointmentStatusConfig = {
  label: string;
  variant: "success" | "warning" | "info" | "primary" | "secondary" | "error";
  icon?: React.ReactNode;
};

export const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatus,
  AppointmentStatusConfig
> = {
  pending: {
    label: "Ожидает",
    variant: "warning",
    icon: (
      <StSvg name="Expand_right" size={16} color={colors.accent.yellow[700]} />
    ),
  },
  confirmed: {
    label: "Подтверждено",
    variant: "success",
  },
  arrived: {
    label: "Пришли",
    variant: "info",
  },
  late: {
    label: "Опоздание",
    variant: "error",
  },
  completed: {
    label: "Завершено",
    variant: "success",
  },
  no_show: {
    label: "Не явились",
    variant: "primary",
  },
  cancelled: {
    label: "Отменили",
    variant: "secondary",
  },
};
