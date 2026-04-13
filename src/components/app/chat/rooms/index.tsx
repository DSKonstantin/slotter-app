import React, { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, Divider, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import type {
  ChatRoom,
  ChatRoomTag,
} from "@/src/store/redux/services/api-types";
import ChatRoomItem from "./ChatRoomItem";

const MOCK_TAGS: ChatRoomTag[] = [
  { id: 1, name: "Новые", color: colors.primary.blue[500] },
  { id: 2, name: "Постоянные", color: colors.primary.green[400] },
  { id: 3, name: "VIP", color: "#CB30E0" },
  { id: 4, name: "Специциие", color: "#FF8D28" },
];

const MOCK_ROOMS: ChatRoom[] = [
  {
    id: 1,
    other_member: {
      id: 10,
      name: "Поддержка",
      avatar_url: null,
      tag: { id: 3, name: "VIP", color: "#CB30E0" },
    },
    last_message: {
      id: 5,
      body: "Что то на языке поддержки",
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      is_mine: false,
      status: "unread",
    },
    unread_count: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    other_member: {
      id: 11,
      name: "Алексей",
      avatar_url: null,
      tag: { id: 2, name: "Постоянные", color: colors.primary.green[400] },
    },
    last_message: {
      id: 6,
      body: "Добавил масло лаванды +300 ₽ Подтвердите!",
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      is_mine: true,
      status: "read",
    },
    unread_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    other_member: {
      id: 12,
      name: "Светлана",
      avatar_url: null,
      tag: null,
    },
    last_message: {
      id: 7,
      body: "Готова принять на 14:00 завтра",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      is_mine: false,
      status: "read",
    },
    unread_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    other_member: {
      id: 13,
      name: "Надежда",
      avatar_url: null,
      tag: { id: 1, name: "Новые", color: colors.primary.blue[500] },
    },
    last_message: {
      id: 8,
      body: "Да",
      created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      is_mine: false,
      status: "read",
    },
    unread_count: 0,
    created_at: new Date().toISOString(),
  },
];

const ALL_TAB = { id: 0, name: "Все", color: colors.primary.blue[500] };

const ChatRoomsScreen = () => {
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tabs = [ALL_TAB, ...MOCK_TAGS];

  const rooms =
    selectedTagId === null
      ? MOCK_ROOMS
      : MOCK_ROOMS.filter((r) => r.other_member.tag?.id === selectedTagId);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
  };

  const onRoomPress = (room: ChatRoom) => {
    router.push(Routers.app.chat.room(room.id));
  };

  return (
    <ScreenWithToolbar title="Чаты">
      {({ topInset, bottomInset }) => (
        <SafeAreaView className="flex-1 px-screen" edges={["left", "right"]}>
          {/* Filter tabs */}
          <View className="mb-5">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: topInset,
                paddingBottom: 8,
                gap: 8,
              }}
            >
              {tabs.map((tag) => {
                const isActive =
                  tag.id === 0
                    ? selectedTagId === null
                    : selectedTagId === tag.id;
                return (
                  <Badge
                    key={tag.id}
                    title={tag.name}
                    size="sm"
                    onPress={() =>
                      setSelectedTagId(tag.id === 0 ? null : tag.id)
                    }
                    style={{
                      backgroundColor: isActive
                        ? tag.color
                        : colors.neutral[100],
                    }}
                    textStyle={{
                      color: isActive ? colors.neutral[0] : colors.neutral[600],
                    }}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* Chat list */}
          {rooms.length === 0 ? (
            <View className="flex-1 items-center justify-center gap-2">
              <Typography
                weight="semibold"
                className="text-neutral-900 text-body"
              >
                Нет чатов
              </Typography>
              <Typography className="text-neutral-500 text-caption">
                Начните переписку с клиентом
              </Typography>
            </View>
          ) : (
            <FlashList
              data={rooms}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ChatRoomItem room={item} onPress={onRoomPress} />
              )}
              contentContainerStyle={{ paddingBottom: bottomInset + 16 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                />
              }
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          )}
        </SafeAreaView>
      )}
    </ScreenWithToolbar>
  );
};

export default ChatRoomsScreen;
