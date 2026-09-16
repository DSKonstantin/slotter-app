import { formatDayMonth, formatTimeFromISO } from "@/src/utils/date/formatTime";
import { formatNumber } from "@/src/utils/text/formatNumber";
import { colors } from "@/src/styles/colors";
import type {
  BroadcastStatus,
  BroadcastStopReason,
  MarketingBroadcast,
} from "@/src/store/redux/services/api-types";

type BadgeVariant =
  "info" | "pending" | "success" | "completed" | "error" | "ghost";

export type BroadcastBadge = {
  title: string;
  variant: BadgeVariant;
  icon: string;
} | null;

export const BADGE_ICON_COLOR: Record<BadgeVariant, string> = {
  info: colors.primary.blue[500],
  pending: colors.accent.orange[500],
  success: colors.primary.green[800],
  completed: colors.primary.green[700],
  error: colors.accent.red[500],
  ghost: colors.neutral[500],
};

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
      return {
        title: "Подготовка",
        variant: "ghost",
        icon: "Server_fill",
      };
    case "scheduled":
      return {
        title: broadcast.scheduled_at
          ? formatDateTime(broadcast.scheduled_at)
          : "Ожидает запуска",
        variant: "info",
        icon: "Time_fill",
      };
    case "running":
      return {
        title: "Идёт отправка",
        variant: "success",
        icon: "Send_fill",
      };
    case "paused":
      return { title: "Приостановлена", variant: "pending", icon: "Stop_fill" };
    case "completed":
      return {
        title: broadcast.finished_at
          ? formatDayMonth(broadcast.finished_at)
          : "Доставлено",
        variant: "completed",
        icon: "Done_round",
      };
    case "cancelled":
      return { title: "Отменена", variant: "error", icon: "Close_round" };
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

export type BroadcastMetric = {
  icon: boolean;
  label: string;
  value: string;
  suffix: { text: string; color: "green" | "blue" } | null;
};

export const getBroadcastMetric = (
  broadcast: MarketingBroadcast,
): BroadcastMetric => {
  const { status, stats } = broadcast;
  if (status === "preparing" || status === "scheduled") {
    return {
      icon: true,
      label: "Аудитория:",
      value: `${formatNumber(stats.recipients_count)} клиентов`,
      suffix: null,
    };
  }

  const { sent_count, delivered_count, read_count } = stats;
  if (read_count > 0) {
    return {
      icon: false,
      label: "Получатели:",
      value: formatNumber(sent_count),
      suffix: {
        text: `${pct(read_count, sent_count)}% прочитано`,
        color: "blue",
      },
    };
  }
  return {
    icon: false,
    label: "Отправлено:",
    value: formatNumber(sent_count),
    suffix: {
      text: `${pct(delivered_count, sent_count)}% доставлено`,
      color: "green",
    },
  };
};

export const CANCELLABLE_STATUSES: BroadcastStatus[] = [
  "preparing",
  "scheduled",
  "running",
  "paused",
];

export const isBroadcastCancellable = (status: BroadcastStatus) =>
  CANCELLABLE_STATUSES.includes(status);
