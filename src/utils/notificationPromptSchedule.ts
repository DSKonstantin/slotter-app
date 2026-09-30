export type NotificationPromptMode = "ask" | "settings";

type PromptCounter = {
  count: number;
  lastShownAt: number | null;
};

export type NotificationPromptState = {
  firstSeenAt: number;
  ask: PromptCounter;
  settings: PromptCounter;
};

type PermissionSnapshot = {
  status: string;
  canAskAgain: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const INTERVAL_DAYS: Record<NotificationPromptMode, number[]> = {
  ask: [3, 7, 14],
  settings: [7, 30],
};

const REPEAT_INTERVAL_DAYS: Record<NotificationPromptMode, number> = {
  ask: 14,
  settings: 30,
};

export const getNotificationPromptStorageKey = (userId: number) =>
  `notifPrompt:user_${userId}`;

export const createNotificationPromptState = (
  now: number,
): NotificationPromptState => ({
  firstSeenAt: now,
  ask: { count: 0, lastShownAt: null },
  settings: { count: 0, lastShownAt: null },
});

export const parseNotificationPromptState = (
  raw: string | null,
): NotificationPromptState | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as NotificationPromptState;
    if (
      typeof parsed?.firstSeenAt !== "number" ||
      typeof parsed.ask?.count !== "number" ||
      typeof parsed.settings?.count !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const getNotificationPromptMode = (
  permission: PermissionSnapshot,
): NotificationPromptMode | null => {
  if (permission.status === "granted") return null;
  if (permission.canAskAgain) return "ask";
  return "settings";
};

export const shouldShowNotificationPrompt = (
  mode: NotificationPromptMode,
  state: NotificationPromptState,
  now: number,
) => {
  const { count, lastShownAt } = state[mode];
  const intervalDays = INTERVAL_DAYS[mode][count] ?? REPEAT_INTERVAL_DAYS[mode];

  const since = lastShownAt ?? state.firstSeenAt;
  return now - since >= intervalDays * DAY_MS;
};

export const markNotificationPromptShown = (
  mode: NotificationPromptMode,
  state: NotificationPromptState,
  now: number,
): NotificationPromptState => ({
  ...state,
  [mode]: { count: state[mode].count + 1, lastShownAt: now },
});
