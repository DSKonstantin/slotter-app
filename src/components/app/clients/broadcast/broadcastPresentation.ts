import { formatDayMonth, formatTimeFromISO } from "@/src/utils/date/formatTime";
import type {
  BroadcastStatus,
  BroadcastStopReason,
  MarketingBroadcast,
} from "@/src/store/redux/services/api-types";

type BadgeVariant = "pending" | "info" | "warning" | "completed" | "muted";

export type BroadcastBadge = { title: string; variant: BadgeVariant } | null;

const formatDateTime = (iso: string) =>
  `${formatDayMonth(iso)} в ${formatTimeFromISO(iso)}`;

export const getBroadcastBadge = (
  broadcast: Pick<
    MarketingBroadcast,
    "status" | "scheduled_at" | "finished_at"
  >,
): BroadcastBadge => {
  switch (broadcast.status) {
    case "preparing":
      return null;
    case "scheduled":
      return {
        title: broadcast.scheduled_at
          ? formatDateTime(broadcast.scheduled_at)
          : "Ожидает запуска",
        variant: "pending",
      };
    case "running":
      return { title: "Отправляется", variant: "info" };
    case "paused":
      return { title: "Приостановлена", variant: "warning" };
    case "completed":
      return {
        title: broadcast.finished_at
          ? formatDayMonth(broadcast.finished_at)
          : "Доставлено",
        variant: "completed",
      };
    case "cancelled":
      return { title: "Отменена", variant: "muted" };
    default:
      return null;
  }
};

export const STOP_REASON_LABELS: Record<
  Exclude<BroadcastStopReason, null>,
  string
> = {
  channel_inactive: "Переподключите канал — рассылка продолжится сама",
  no_active_channel: "Подключите канал и создайте рассылку заново",
  empty_audience: "Под фильтры не подошёл ни один клиент",
};

export const getStopReasonLabel = (
  reason: BroadcastStopReason,
): string | null => (reason ? STOP_REASON_LABELS[reason] : null);

export const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

export const getBroadcastMetric = (broadcast: MarketingBroadcast): string => {
  const { status, stats } = broadcast;
  if (status === "preparing" || status === "scheduled")
    return `Аудитория: ${stats.recipients_count} клиентов`;

  const { sent_count, delivered_count, read_count } = stats;
  if (read_count > 0)
    return `Получатели: ${sent_count}, ${pct(read_count, sent_count)}% прочитано`;
  return `Отправлено: ${sent_count}, ${pct(delivered_count, sent_count)}% доставлено`;
};

export const CANCELLABLE_STATUSES: BroadcastStatus[] = [
  "preparing",
  "scheduled",
  "running",
  "paused",
];

export const isBroadcastCancellable = (status: BroadcastStatus) =>
  CANCELLABLE_STATUSES.includes(status);
