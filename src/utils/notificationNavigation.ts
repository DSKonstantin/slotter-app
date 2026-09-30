import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { NOTIFICATION_KIND_CONFIG } from "@/src/constants/notificationKinds";
import type { NotificationKind } from "@/src/store/redux/services/api-types";

type OpenPersonalAccount = (path?: string) => void | Promise<void>;

/**
 * Handles the notification kinds that need to open the upgrade web page or
 * an in-app settings screen instead of the usual subject-based navigation
 * (subscription_grace, direct_channel_grace, direct_channel_disconnected).
 * Returns true if it handled the tap — the caller should stop there. Returns
 * false for every other kind, so the caller falls back to its own
 * subject-based routing (which differs between the in-app notification feed
 * and the push-notification tap handler, so it isn't shared here).
 */
export const handleKindNavigation = (
  kind: string | undefined,
  openPersonalAccount: OpenPersonalAccount,
): boolean => {
  const kindConfig = kind
    ? NOTIFICATION_KIND_CONFIG[kind as NotificationKind]
    : undefined;

  if (kindConfig?.openUpgrade) {
    openPersonalAccount("/go/upgrade");
    return true;
  }
  if (kindConfig?.detailRoute) {
    router.push(kindConfig.detailRoute as any);
    return true;
  }
  return false;
};

export type NotificationSubjectType = "Appointment" | "ChatRoom";

const inferSubjectType = (
  kind: string | undefined,
): NotificationSubjectType | undefined => {
  if (
    kind?.startsWith("appointment_") ||
    kind?.startsWith("rebook_") ||
    kind === "review_request"
  ) {
    return "Appointment";
  }
  if (kind === "chat_new_activity") return "ChatRoom";
  return undefined;
};

type NavigateFromNotificationParams = {
  kind: string | undefined;
  subjectId?: number | null;
  subjectType?: string | null;
  openPersonalAccount: OpenPersonalAccount;
};

export const navigateFromNotification = ({
  kind,
  subjectId,
  subjectType,
  openPersonalAccount,
}: NavigateFromNotificationParams): boolean => {
  if (subjectId) {
    const type = subjectType ?? inferSubjectType(kind);
    if (type === "Appointment") {
      router.push(Routers.app.slot(subjectId));
      return true;
    }
    if (type === "ChatRoom") {
      router.push(Routers.app.chat.room(subjectId));
      return true;
    }
  }
  return handleKindNavigation(kind, openPersonalAccount);
};
