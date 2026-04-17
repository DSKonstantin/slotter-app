import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useGetChatRoomsQuery } from "@/src/store/redux/services/api/chatRoomsApi";
import type { ChatRoomTag } from "@/src/store/redux/services/api-types";
import ChatRoomItem from "./ChatRoomItem";
import ChatRoomsSkeleton from "./ChatRoomsSkeleton";
import { NewChatSheet } from "./NewChatSheet";

const RoomSeparator = () => <View className="h-2" />;

const ALL_TAB: ChatRoomTag = {
  id: 0,
  name: "Все",
  color: colors.primary.blue[500],
};

export default function ChatRoomsScreen() {
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [newChatVisible, setNewChatVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, refetch } = useGetChatRoomsQuery(undefined);

  const rooms = useMemo(
    () => (data?.chat_rooms ?? []).filter((r) => r.other_member != null),
    [data],
  );

  const tags = useMemo<ChatRoomTag[]>(() => {
    const seen = new Set<number>();
    return rooms.reduce<ChatRoomTag[]>((acc, r) => {
      const tag = r.other_member?.tag;
      if (tag && !seen.has(tag.id)) {
        seen.add(tag.id);
        acc.push(tag);
      }
      return acc;
    }, []);
  }, [rooms]);

  const filteredRooms = useMemo(
    () =>
      selectedTagId === null
        ? rooms
        : rooms.filter((r) => r.other_member?.tag?.id === selectedTagId),
    [rooms, selectedTagId],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  if (isLoading) return <ChatRoomsSkeleton />;

  return (
    <>
      <ScreenWithToolbar
        title="Чаты"
        rightButton={
          <IconButton
            icon={
              <StSvg name="Add_round" size={24} color={colors.neutral[900]} />
            }
            onPress={() => setNewChatVisible(true)}
          />
        }
      >
        {({ topInset, bottomInset }) => (
          <View className="flex-1">
            <View className="mb-2 px-screen">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingTop: topInset,
                  paddingBottom: 8,
                  gap: 8,
                }}
              >
                {[ALL_TAB, ...tags].map((tag) => {
                  const isActive =
                    tag.id === 0
                      ? selectedTagId === null
                      : selectedTagId === tag.id;
                  return (
                    <Badge
                      key={tag.id}
                      title={tag.name}
                      onPress={() =>
                        setSelectedTagId(tag.id === 0 ? null : tag.id)
                      }
                      style={{
                        backgroundColor: isActive
                          ? tag.color
                          : colors.neutral[100],
                      }}
                      textStyle={{
                        color: isActive
                          ? colors.neutral[0]
                          : colors.neutral[600],
                      }}
                    />
                  );
                })}
              </ScrollView>
            </View>

            {filteredRooms.length === 0 ? (
              <View
                className="flex-1 items-center justify-center gap-2"
                style={{ paddingBottom: bottomInset + 96 }}
              >
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
                data={filteredRooms}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <ChatRoomItem
                    room={item}
                    onPress={() => router.push(Routers.app.chat.room(item.id))}
                  />
                )}
                contentContainerStyle={{
                  paddingBottom: bottomInset + 16,
                  paddingHorizontal: 20,
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                  />
                }
                ItemSeparatorComponent={RoomSeparator}
              />
            )}
          </View>
        )}
      </ScreenWithToolbar>

      <NewChatSheet
        visible={newChatVisible}
        onClose={() => setNewChatVisible(false)}
      />
    </>
  );
}
