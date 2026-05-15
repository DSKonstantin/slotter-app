import React, { useState, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";

import {
  useGetNotificationsPaginatedInfiniteQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/src/store/redux/services/api/notificationsApi";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { toast } from "@backpackapp-io/react-native-toast";

import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

import { StSvg } from "@/src/components/ui";

type BadgeType = "clock" | "message" | "check" | "warning" | "star";

const BADGE_MAP: Record<BadgeType, { name: string; color: string }> = {
  clock: { name: "Clock_fill", color: "#007AFF" },
  message: { name: "Chield_check_fill", color: "#CB30E0" },
  check: { name: "Check_fill", color: "#34C759" },
  warning: { name: "Warning_fill", color: "#FF3B30" },
  star: { name: "Star_fill", color: "#FBB40E" },
};

function BadgeIcon({ type }: { type: BadgeType }) {
  const icon = BADGE_MAP[type];

  return (
    <View className="absolute top-7 left-6 w-6 h-6 items-center justify-center bg-white rounded-full">
      <StSvg name={icon.name} size={20} color={icon.color} />
    </View>
  );
}

const tabs = ["Все", "Записи", "Отзывы", "Сообщения", "Уведомления"];

const getNotificationImage = (n: any) => {
  const subject = n.subject;

  if (n.kind === "chat_new_activity") {
    return subject?.interlocutor?.avatar_url || null;
  }

  return subject?.user?.avatar_url || null;
};

const HistoryScreen = () => {
  const [activeTab, setActiveTab] = useState("Уведомления");

  const auth = useRequiredAuth();

  const { data, refetch } = useGetNotificationsPaginatedInfiniteQuery({});

  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();

  const notifications = useMemo(() => {
    return data?.pages?.flatMap((p) => p.notifications) ?? [];
  }, [data]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read_at).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "Все":
        return notifications;

      case "Записи":
        return notifications.filter((n) => n.kind?.startsWith("appointment_"));

      case "Сообщения":
        return notifications.filter((n) => n.kind?.startsWith("chat_"));

      case "Отзывы":
        return notifications.filter((n) => n.kind?.startsWith("review_"));

      case "Уведомления":
        return notifications.filter(
          (n) =>
            !n.kind?.startsWith("chat_") &&
            !n.kind?.startsWith("appointment_") &&
            !n.kind?.startsWith("review_"),
        );

      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, any[]> = {};

    filteredNotifications.forEach((n) => {
      const date = new Date(n.created_at);

      let key = format(date, "d MMMM", { locale: ru });

      if (isToday(date)) key = "Сегодня";
      else if (isYesterday(date)) key = "Вчера";

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });

    return groups;
  }, [filteredNotifications]);

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch {
      toast.error("Не удалось обновить уведомления");
    }
  };

  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  if (!auth) return null;

  return (
    <ScreenWithToolbar
      title={
        <View className="items-center">
          <Text className="text-lg font-semibold">Журнал событий</Text>

          {unreadCount > 0 && (
            <Text className="text-xs text-neutral-400">
              {unreadCount} новых
            </Text>
          )}
        </View>
      }
      rightButton={
        <TouchableOpacity
          className="rounded-full bg-white px-3 py-[12px]"
          onPress={async () => {
            try {
              await markAllRead().unwrap();
            } catch {
              toast.error("Не удалось прочитать все");
            }
          }}
        >
          <Text className="text-black text-sm">Прочитать все</Text>
        </TouchableOpacity>
      }
    >
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset + 16,
            paddingBottom: bottomInset + 16,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                gap: 10,
              }}
            >
              {tabs.map((tab) => {
                const active = activeTab === tab;

                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full ${
                      active ? "bg-blue-500" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        active ? "text-white" : "text-neutral-500"
                      }`}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View className="px-5 mt-4">
            {Object.entries(groupedNotifications).length === 0 ? (
              <Text className="text-neutral-400 text-center mt-10">
                Нет уведомлений
              </Text>
            ) : (
              Object.entries(groupedNotifications).map(([date, items]) => (
                <View key={date} className="mb-6">
                  <Text className="text-black font-semibold mb-3">{date}</Text>

                  <View className="gap-3">
                    {items.map((n) => {
                      const badge = {
                        clock: "clock",
                        message: "message",
                        check: "check",
                        warning: "warning",
                        star: "star",
                      } as const;

                      return (
                        <TouchableOpacity
                          key={n.id}
                          onPress={() => markRead(n.id)}
                          className="p-4 rounded-2xl bg-white"
                        >
                          <View className="flex-row items-start gap-3">
                            <View className="w-11 h-11 rounded-full overflow-hidden bg-[#E5E5EA]">
                              {getNotificationImage(n) && (
                                <Image
                                  source={{
                                    uri: getNotificationImage(n),
                                  }}
                                  className="w-full h-full"
                                  resizeMode="cover"
                                />
                              )}
                            </View>

                            <BadgeIcon
                              type={
                                (badge[
                                  n.kind as keyof typeof badge
                                ] as BadgeType) ?? "message"
                              }
                            />

                            <View className="flex-1">
                              <View className="flex-row justify-between items-start">
                                <Text className="font-semibold text-black flex-1 pr-2">
                                  {n.title}
                                </Text>

                                <View className="flex-row items-center gap-2">
                                  <Text className="text-xs text-neutral-400">
                                    {new Date(n.created_at).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </Text>

                                  {!n.read_at && (
                                    <View className="w-2 h-2 rounded-full bg-accent-red-500" />
                                  )}
                                </View>
                              </View>

                              <Text className="text-neutral-500 mt-1">
                                {n.body}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default HistoryScreen;
