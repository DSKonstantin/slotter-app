import { colors } from "@/src/styles/colors";

import type { InsightCategory } from "./InsightCard";

export type InsightCategoryConfig = {
  label: string;
  pillBg: string;
  pillTextColor: string;
  color: string;
};

export const INSIGHT_CATEGORY_CONFIG: Record<
  InsightCategory,
  InsightCategoryConfig
> = {
  analytics: {
    label: "Аналитика",
    pillBg: "bg-primary-blue-500",
    pillTextColor: colors.accent.azure[500],
    color: colors.primary.blue[500],
  },
  education: {
    label: "Обучение",
    pillBg: "bg-primary-green-500",
    pillTextColor: colors.primary.green[700],
    color: colors.primary.green[500],
  },
  tip: {
    label: "Совет",
    pillBg: "bg-accent-purple-500",
    pillTextColor: colors.neutral[0],
    color: colors.accent.purple[500],
  },
  reminder: {
    label: "Напоминание",
    pillBg: "bg-accent-orange-500",
    pillTextColor: colors.neutral[0],
    color: colors.accent.orange[500],
  },
  update: {
    label: "Обновление",
    pillBg: "bg-primary-green-500",
    pillTextColor: colors.primary.green[700],
    color: colors.primary.green[500],
  },
  offer: {
    label: "Предложение",
    pillBg: "bg-accent-indigo-500",
    pillTextColor: colors.primary.blue[100],
    color: colors.accent.indigo[500],
  },
  event: {
    label: "Новое событие",
    pillBg: "bg-accent-mint-500",
    pillTextColor: colors.neutral[0],
    color: colors.accent.mint[500],
  },
};
