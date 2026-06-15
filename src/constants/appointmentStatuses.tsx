import React from "react";

import type { AppointmentStatus } from "@/src/store/redux/services/api-types/appointment";
import type { CalendarFilters } from "@/src/store/redux/slices/calendarSlice";

export type AppointmentStatusConfig = {
  label: string;
  filterLabel: string;
  filterKey: keyof CalendarFilters;
  variant:
    | "success"
    | "warning"
    | "info"
    | "primary"
    | "secondary"
    | "error"
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
    label: "Ожидает",
    filterLabel: "Ожидающие подтверждения",
    filterKey: "showPending",
    variant: "warning",
    statusLineClass: "bg-accent-yellow-500",
  },
  proposed: {
    label: "Предложено",
    filterLabel: "Предложенные",
    filterKey: "showProposed",
    variant: "info",
    statusLineClass: "bg-primary-blue-100",
  },
  confirmed: {
    label: "Подтверждено",
    filterLabel: "Подтверждённые",
    filterKey: "showConfirmed",
    variant: "success",
    statusLineClass: "bg-primary-green-500",
  },
  arrived: {
    label: "Пришел",
    filterLabel: "Пришли",
    filterKey: "showArrived",
    variant: "info",
    statusLineClass: "bg-primary-blue-100",
  },
  late: {
    label: "Опоздание",
    filterLabel: "Опоздали",
    filterKey: "showLate",
    variant: "error",
    statusLineClass: "bg-accent-red-500",
  },
  completed: {
    label: "Завершено",
    filterLabel: "Завершённые",
    filterKey: "showCompleted",
    variant: "completed",
    statusLineClass: "bg-primary-green-100",
  },
  no_show: {
    label: "Не пришёл",
    filterLabel: "Не явились",
    filterKey: "showNoShow",
    variant: "destructive",
    statusLineClass: "bg-accent-red-500",
  },
  cancelled: {
    label: "Отменена",
    filterLabel: "Отменённые",
    filterKey: "showCancelled",
    variant: "destructive",
    statusLineClass: "bg-accent-red-500",
  },
  declined: {
    label: "Отклонено",
    filterLabel: "Отклонённые",
    filterKey: "showDeclined",
    variant: "destructive",
    statusLineClass: "bg-accent-red-500",
  },
};
