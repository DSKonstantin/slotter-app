import type { DateRange } from "@/src/utils/date/dateRange";

export type BroadcastChannel = "telegram" | "max" | "bot";

export type BroadcastFilter = "all" | "scheduled" | "completed";

export type AudienceFilters = {
  spentMoreThan?: number;
  avgCheckMoreThan?: number;
  visits?: { from?: number; to?: number };
  visitDate?: DateRange;
  birthDate?: DateRange;
  categoryIds?: string[];
};

export const EMPTY_AUDIENCE_FILTERS: AudienceFilters = {};

export const MOCK_CLIENT_CATEGORIES: { id: string; label: string }[] = [
  { id: "vip", label: "VIP" },
  { id: "regular", label: "Постоянные" },
  { id: "new", label: "Новые" },
  { id: "inactive", label: "Давно не были" },
  { id: "birthday", label: "Именинники" },
];

export type BroadcastFormData = {
  name: string;
  message: string;
  onlyConsented: boolean;
  isScheduled: boolean;
  scheduledDate?: DateRange;
  scheduledTime?: number;
  channel: string;
  audienceFilters?: AudienceFilters;
};

export type BroadcastItem = {
  id: string;
  channel: BroadcastChannel;
  filter: Exclude<BroadcastFilter, "all">;
  title: string;
  message: string;
  headerBadge?: { title: string; variant: "pending" | "completed" };
  headerDate?: string;
  stat: {
    label: string;
    value: string;
    note?: string;
    noteColor?: "green" | "blue";
    audience?: boolean;
  };
  form: BroadcastFormData;
};

export const getBroadcastById = (id: string | undefined) =>
  id ? BROADCASTS.find((item) => item.id === id) : undefined;

export const CHANNEL_LABELS: Record<BroadcastChannel, string> = {
  telegram: "Telegram Bot",
  max: "Макс Bot",
  bot: "Бот Slotter",
};

export const BROADCAST_FILTERS: { label: string; value: BroadcastFilter }[] = [
  { label: "Все", value: "all" },
  { label: "Запланированные", value: "scheduled" },
  { label: "Завершённые", value: "completed" },
];

export const BROADCASTS: BroadcastItem[] = [
  {
    id: "1",
    channel: "telegram",
    filter: "scheduled",
    title: "Напоминание о записи на стрижку",
    message:
      "«Не забудьте подтвердить ваш визит на завтра, мы вас ждём в 10:00»",
    headerBadge: { title: "Завтра в 10:00", variant: "pending" },
    stat: { label: "Аудитория", value: "279 клиентов", audience: true },
    form: {
      name: "Напоминание о записи на стрижку",
      message:
        "Не забудьте подтвердить ваш визит на завтра, мы вас ждём в 10:00",
      onlyConsented: true,
      isScheduled: true,
      scheduledDate: { from: "2026-09-10", to: "2026-09-12" },
      scheduledTime: 600,
      channel: "telegram",
    },
  },
  {
    id: "2",
    channel: "max",
    filter: "completed",
    title: "Скидка 20% на повторный визит",
    message:
      "«Дарим промокод BACK20 на все услуги до конца месяца. Ждём вас снова!»",
    headerBadge: { title: "Доставлено", variant: "completed" },
    stat: {
      label: "Отправлено",
      value: "1 025",
      note: "98,2% доставлено",
      noteColor: "green",
    },
    form: {
      name: "Скидка 20% на повторный визит",
      message:
        "Дарим промокод BACK20 на все услуги до конца месяца. Ждём вас снова!",
      onlyConsented: true,
      isScheduled: false,
      channel: "max",
    },
  },
  {
    id: "3",
    channel: "max",
    filter: "completed",
    title: "Обновление графика работы в праздники",
    message:
      "«Обратите внимание: 24 и 25 августа салон работает с 11:00 до 18:00»",
    headerDate: "18 авг",
    stat: {
      label: "Получатели",
      value: "418",
      note: "74% прочитано",
      noteColor: "blue",
    },
    form: {
      name: "Обновление графика работы в праздники",
      message:
        "Обратите внимание: 24 и 25 августа салон работает с 11:00 до 18:00",
      onlyConsented: false,
      isScheduled: false,
      channel: "max",
    },
  },
];
