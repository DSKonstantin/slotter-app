import React, { memo, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  SectionList,
  Share,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { isToday, isYesterday } from "date-fns";
import { formatDayMonthLong } from "@/src/utils/date/formatDate";
import { formatTime } from "@/src/utils/date/formatTime";
import { toast } from "@backpackapp-io/react-native-toast";
import { Routers } from "@/src/constants/routers";

import {
  useGetNotificationsPaginatedInfiniteQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/src/store/redux/services/api/notificationsApi";
import type {
  Notification,
  NotificationKind,
  AppointmentNotificationSubject,
  ChatNotificationSubject,
} from "@/src/store/redux/services/api-types";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { Avatar, Button, StSvg, Typography } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/redux/store";
import { useRefresh } from "@/src/hooks/useRefresh";
import { pluralize } from "@/src/utils/text/pluralize";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";
import HistorySkeleton from "./HistorySkeleton";

// ── Badge config ─────────────────────────────────────────────────────────────

const KIND_BADGE: Record<
  NotificationKind,
  { icon: string; color: string; rotate?: number; bgColor?: string }
> = {
  appointment_created: {
    icon: "Add_round_fill",
    color: colors.primary.blue[500],
  },
  appointment_pending_approval: {
    icon: "Add_round_fill",
    color: colors.primary.blue[500],
  },
  appointment_confirmed: {
    icon: "Check_fill",
    color: colors.primary.green[700],
  },
  appointment_cancelled: {
    icon: "Close_round_fill",
    color: colors.accent.red[500],
  },
  appointment_rescheduled: {
    icon: "Clock_fill",
    color: colors.accent.yellow[700],
  },
  appointment_reminder: {
    icon: "Clock_fill",
    color: colors.primary.blue[500],
  },
  appointment_requested: {
    icon: "Add_round_fill",
    color: colors.primary.blue[500],
  },
  appointment_request_accepted: {
    icon: "Check_fill",
    color: colors.primary.green[500],
  },
  appointment_customer_accepted: {
    icon: "Check_fill",
    color: colors.primary.green[500],
  },
  appointment_customer_declined: {
    icon: "Close_round_fill",
    color: colors.accent.red[500],
  },
  appointment_reschedule_requested: {
    icon: "Sort_arrow",
    color: colors.neutral[0],
    bgColor: colors.accent.orange[500],
    rotate: 90,
  },
  rebook_suggestion: {
    icon: "Star_fill",
    color: colors.accent.yellow[700],
  },
  chat_new_activity: {
    icon: "Chat_fill",
    color: colors.accent.purple[500],
  },
};

const DEFAULT_BADGE = { icon: "Clock_fill", color: colors.neutral[400] };

// ── Notification row ──────────────────────────────────────────────────────────

type NotificationRowProps = {
  item: Notification;
  onPress: (item: Notification) => void;
};

function isAppointmentSubject(
  s: AppointmentNotificationSubject | ChatNotificationSubject,
): s is AppointmentNotificationSubject {
  return "customer" in s;
}

const NotificationRow = memo(({ item, onPress }: NotificationRowProps) => {
  const badge = KIND_BADGE[item.kind] ?? DEFAULT_BADGE;
  const person = item.subject
    ? isAppointmentSubject(item.subject)
      ? item.subject.customer
      : item.subject.interlocutor
    : undefined;

  return (
    <Pressable
      className="flex-row items-start gap-3 p-4 rounded-base bg-white active:opacity-70"
      onPress={() => onPress(item)}
    >
      <View>
        <Avatar
          name={person?.name ?? ""}
          uri={person?.avatar_url ?? undefined}
          blurhash={person?.avatar_blurhash}
          size="md"
        />
        <View
          className="absolute -bottom-1 -right-1 w-[20px] h-[20px] items-center justify-center rounded-full"
          style={{ backgroundColor: badge.bgColor ?? "white" }}
        >
          <StSvg
            name={badge.icon}
            size={18}
            color={badge.color}
            style={
              badge.rotate
                ? { transform: [{ rotate: `${badge.rotate}deg` }] }
                : undefined
            }
          />
        </View>
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-start gap-2">
          <Typography
            weight="semibold"
            className="text-body text-neutral-900 flex-1"
          >
            {item.title}
          </Typography>
          <View className="flex-row items-center gap-1.5 shrink-0">
            <Typography className="text-caption text-neutral-400">
              {formatTime(new Date(item.created_at))}
            </Typography>
            {!item.read_at && (
              <View className="w-[10px] h-[10px] rounded-full bg-accent-red-500" />
            )}
          </View>
        </View>
        <Typography className="text-caption text-neutral-500 mt-1">
          {item.body}
        </Typography>
      </View>
    </Pressable>
  );
});

NotificationRow.displayName = "NotificationRow";

type Section = { title: string; data: Notification[] };

const HistoryScreen = () => {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetNotificationsPaginatedInfiniteQuery({});

  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();

  const user = useAppSelector((s) => s.auth.user);

  const { refreshing, onRefresh } = useRefresh(refetch);

  const notifications = useMemo(
    () => data?.pages?.flatMap((p) => p.notifications) ?? [],
    [data],
  );

  const unreadCount = data?.pages[0]?.unread_count ?? 0;

  const sections = useMemo<Section[]>(() => {
    const groups: Record<string, Notification[]> = {};

    notifications.forEach((n) => {
      const date = new Date(n.created_at);
      let key: string;

      if (isToday(date)) key = "Сегодня";
      else if (isYesterday(date)) key = "Вчера";
      else key = formatDayMonthLong(date);

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });

    return Object.entries(groups).map(([title, items]) => ({
      title,
      data: items,
    }));
  }, [notifications]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead().unwrap();
    } catch {
      toast.error("Не удалось прочитать все");
    }
  }, [markAllRead]);

  const handlePress = useCallback(
    (notification: Notification) => {
      if (!notification.read_at) {
        markRead(notification.id);
      }
      if (!notification.subject) return;
      if (isAppointmentSubject(notification.subject)) {
        router.push(Routers.app.history.slot(notification.subject.id));
      } else {
        router.push(Routers.app.chat.room(notification.subject.id));
      }
    },
    [markRead],
  );

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleShareLink = useCallback(async () => {
    if (!user?.nickname) return;
    const url = `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${user.nickname}`;
    await Share.share({ url, message: url });
  }, [user?.nickname]);

  return (
    <ScreenWithToolbar
      title={
        <View className="items-center">
          <Typography
            numberOfLines={1}
            weight="semibold"
            className="min-w-0 text-body"
          >
            Журнал событий
          </Typography>
          <Typography
            numberOfLines={1}
            className={`min-w-0 text-caption ${unreadCount > 0 ? "text-neutral-400" : "text-transparent"}`}
          >
            {unreadCount > 0
              ? `${unreadCount} ${pluralize(unreadCount, ["новое", "новых", "новых"])}`
              : " "}
          </Typography>
        </View>
      }
      rightButton={
        <Button
          title="Прочитать все"
          variant="secondary"
          buttonClassName="h-[48px] px-4 rounded-full"
          textClassName="text-[13px]"
          loading={isMarkingAll}
          disabled={isMarkingAll || unreadCount === 0}
          onPress={handleMarkAllRead}
        />
      }
    >
      {({ topInset, bottomInset }) => {
        if (isLoading) {
          return <HistorySkeleton topInset={topInset} />;
        }

        if (isError && !data) {
          return (
            <ErrorScreen
              title="Не удалось загрузить уведомления"
              isLoading={isFetching}
              onRetry={onRefresh}
            />
          );
        }

        return (
          <SectionList
            sections={sections}
            stickySectionHeadersEnabled={false}
            keyExtractor={(item) => String(item.id)}
            contentInset={Platform.OS === "ios" ? { top: topInset } : undefined}
            contentOffset={
              Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
            }
            contentContainerStyle={{
              paddingTop: Platform.OS === "ios" ? 0 : topInset,
              paddingBottom: bottomInset + 8,
              paddingHorizontal: SCREEN_PADDING,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                progressViewOffset={Platform.select({ android: topInset })}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => (
              <NotificationRow item={item} onPress={handlePress} />
            )}
            renderSectionHeader={({ section }) => (
              <Typography
                weight="semibold"
                className={`text-body text-neutral-900 pb-2${sections[0]?.title === section.title ? "" : " mt-8"}`}
              >
                {section.title}
              </Typography>
            )}
            SectionSeparatorComponent={() => null}
            ItemSeparatorComponent={() => <View className="h-2" />}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  size="small"
                  color={colors.neutral[400]}
                  style={{ paddingVertical: 16 }}
                />
              ) : null
            }
            ListEmptyComponent={
              <View
                className="flex-1 items-center justify-center gap-5"
                style={{
                  marginBottom: bottomInset + 8,
                }}
              >
                <Image
                  style={{ width: 159, height: 142 }}
                  source={require("@/assets/images/app/root-box.png")}
                />
                <View className="gap-2">
                  <Typography
                    weight="semibold"
                    className="text-display text-center"
                  >
                    Пока тихо
                  </Typography>
                  <Typography className="text-body text-neutral-500 text-center">
                    События появятся когда придут  первые записи
                  </Typography>
                </View>

                <Button
                  buttonClassName="w-full"
                  title="Поделиться ссылкой"
                  variant="accent"
                  onPress={handleShareLink}
                  rightIcon={
                    <StSvg
                      name="External-bold"
                      size={24}
                      color={colors.neutral[0]}
                    />
                  }
                />
              </View>
            }
          />
        );
      }}
    </ScreenWithToolbar>
  );
};

export default HistoryScreen;
