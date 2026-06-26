import React from "react";

import type { AppointmentStatus } from "@/src/store/redux/services/api-types/appointment";

export type AppointmentStatusConfig = {
  status: AppointmentStatus;
  label: string;
  filterLabel: string;
  defaultActive: boolean;
  variant:
    | "success"
    | "warning"
    | "info"
    | "primary"
    | "secondary"
    | "error"
    | "arrived"
    | "destructive"
    | "completed";
  icon?: React.ReactNode;
  statusLineClass?: string | null;
};

export const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatus,
  AppointmentStatusConfig
> = {
  pending: {
    status: "pending",
    label: "Ожидает",
    filterLabel: "Ожидающие подтверждения",
    defaultActive: true,
    variant: "warning",
    statusLineClass: "bg-accent-yellow-500",
  },
  proposed: {
    status: "proposed",
    label: "Предложено",
    filterLabel: "Предложенные",
    defaultActive: true,
    variant: "info",
    statusLineClass: "bg-primary-blue-100",
  },
  confirmed: {
    status: "confirmed",
    label: "Подтверждено",
    filterLabel: "Подтверждённые",
    defaultActive: true,
    variant: "success",
    statusLineClass: "bg-primary-green-500",
  },
  arrived: {
    status: "arrived",
    label: "Пришел",
    filterLabel: "Пришли",
    defaultActive: true,
    variant: "arrived",
    statusLineClass: "bg-primary-blue-500",
  },
  late: {
    status: "late",
    label: "Опоздание",
    filterLabel: "Опоздали",
    defaultActive: true,
    variant: "error",
    statusLineClass: "bg-accent-red-500",
  },
  completed: {
    status: "completed",
    label: "Завершено",
    filterLabel: "Завершённые",
    defaultActive: true,
    variant: "success",
    statusLineClass: "bg-primary-green-500",
  },
  no_show: {
    status: "no_show",
    label: "Не пришёл",
    filterLabel: "Не явились",
    defaultActive: true,
    variant: "destructive",
    statusLineClass: "bg-accent-red-500",
  },
  cancelled: {
    status: "cancelled",
    label: "Отменена",
    filterLabel: "Отменённые",
    defaultActive: false,
    variant: "destructive",
    statusLineClass: "bg-accent-red-500",
  },
  declined: {
    status: "declined",
    label: "Отклонено",
    filterLabel: "Отклонённые",
    defaultActive: false,
    variant: "destructive",
    statusLineClass: "bg-accent-red-500",
  },
};
