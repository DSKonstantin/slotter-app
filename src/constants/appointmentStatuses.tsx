import React from "react";

import type { AppointmentStatus } from "@/src/store/redux/services/api-types/appointment";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";

export type AppointmentStatusConfig = {
  status: AppointmentStatus;
  label: string;
  filterLabel: string;
  defaultActive: boolean;
  variant:
    | "success"
    | "warning"
    | "pending"
    | "info"
    | "primary"
    | "secondary"
    | "error"
    | "arrived"
    | "destructive"
    | "completed"
    | "muted";
  icon?: React.ReactNode;
  statusLineClass?: string | null;
};

// Псевдостатус отображения для записей со скрытым квотой клиентом
// (isHiddenCustomer). Намеренно НЕ в APPOINTMENT_STATUS_CONFIG: его
// итерируют фильтры календаря (calendarFilterModal) и
// DEFAULT_ACTIVE_STATUSES (calendarSlice), а это не статус записи —
// у записи при этом остаётся свой настоящий status.
export const QUOTA_HIDDEN_STATUS_CONFIG: Omit<
  AppointmentStatusConfig,
  "status" | "filterLabel" | "defaultActive"
> = {
  label: "Закончился лимит",
  variant: "muted",
  statusLineClass: "bg-neutral-500",
};

export const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatus,
  AppointmentStatusConfig
> = {
  requested: {
    status: "requested",
    label: "Запрос услуги",
    filterLabel: "Новые заявки",
    defaultActive: true,
    variant: "arrived",
    statusLineClass: "bg-primary-blue-500",
  },
  pending: {
    status: "pending",
    label: "Ожидает",
    filterLabel: "Ожидающие подтверждения",
    defaultActive: true,
    variant: "pending",
    statusLineClass: "bg-accent-yellow-500",
    icon: (
      <StSvg name="Expand_right" size={16} color={colors.accent.orange[500]} />
    ),
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
  delayed: {
    status: "delayed",
    label: "Опоздал",
    filterLabel: "Опоздали",
    defaultActive: true,
    variant: "warning",
    statusLineClass: "bg-accent-yellow-500",
  },
  completed: {
    status: "completed",
    label: "Завершено",
    filterLabel: "Завершённые",
    defaultActive: true,
    variant: "success",
    statusLineClass: "bg-primary-green-500",
  },
  missed: {
    status: "missed",
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
};
