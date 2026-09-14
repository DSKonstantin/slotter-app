import type { NotificationTemplateStage } from "@/src/store/redux/services/api-types";

export const STAGE_ORDER: NotificationTemplateStage[] = [
  "booking",
  "before",
  "retention",
];

export const STAGE_TITLES: Record<NotificationTemplateStage, string> = {
  booking: "При записи",
  before: "Перед визитом",
  retention: "Возвращаемость",
};
