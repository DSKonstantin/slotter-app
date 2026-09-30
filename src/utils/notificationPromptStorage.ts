import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createNotificationPromptState,
  getNotificationPromptMode,
  getNotificationPromptStorageKey,
  markNotificationPromptShown,
  parseNotificationPromptState,
  shouldShowNotificationPrompt,
  type NotificationPromptMode,
} from "@/src/utils/notificationPromptSchedule";

type PermissionSnapshot = Parameters<typeof getNotificationPromptMode>[0];

export const takeDueNotificationPromptMode = async (
  userId: number,
  permission: PermissionSnapshot,
): Promise<NotificationPromptMode | null> => {
  const mode = getNotificationPromptMode(permission);
  if (!mode) return null;

  const key = getNotificationPromptStorageKey(userId);
  const now = Date.now();
  const stored = parseNotificationPromptState(await AsyncStorage.getItem(key));

  if (!stored) {
    await AsyncStorage.setItem(
      key,
      JSON.stringify(createNotificationPromptState(now)),
    );
    return null;
  }

  if (!shouldShowNotificationPrompt(mode, stored, now)) return null;

  await AsyncStorage.setItem(
    key,
    JSON.stringify(markNotificationPromptShown(mode, stored, now)),
  );
  return mode;
};
