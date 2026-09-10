import { formatDuration } from "@/src/utils/date/formatTime";

export const BREAK_AFTER_MODAL_DESCRIPTION =
  "Интервал времени, который автоматически добавляется после этой услуги к длительности записи";

export const formatBreakAfter = (minutes: number): string =>
  minutes > 0 ? formatDuration(minutes) : "Нет";
