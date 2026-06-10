import React from "react";

import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
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
  },
  proposed: {
    label: "Предложено",
    filterLabel: "Предложенные",
    filterKey: "showProposed",
    variant: "info",
  },
  confirmed: {
    label: "Подтверждено",
    filterLabel: "Подтверждённые",
    filterKey: "showConfirmed",
    variant: "success",
  },
  arrived: {
    label: "Пришел",
    filterLabel: "Пришли",
    filterKey: "showArrived",
    variant: "info",
  },
  late: {
    label: "Опоздание",
    filterLabel: "Опоздали",
    filterKey: "showLate",
    variant: "error",
  },
  completed: {
    label: "Завершено",
    filterLabel: "Завершённые",
    filterKey: "showCompleted",
    variant: "completed",
  },
  no_show: {
    label: "Не пришёл",
    filterLabel: "Не явились",
    filterKey: "showNoShow",
    variant: "destructive",
  },
  cancelled: {
    label: "Отменено",
    filterLabel: "Отменённые",
    filterKey: "showCancelled",
    variant: "secondary",
  },
  declined: {
    label: "Отклонено",
    filterLabel: "Отклонённые",
    filterKey: "showDeclined",
    variant: "error",
  },
};
