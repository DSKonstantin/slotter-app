import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useGetChatRoomsQuery } from "@/src/store/redux/services/api/chatRoomsApi";
import type {
  ChatRoom,
  ChatRoomTag,
} from "@/src/store/redux/services/api-types";
import ChatRoomItem from "./ChatRoomItem";
import ChatRoomsSkeleton from "./ChatRoomsSkeleton";
import { NewChatSheet } from "./NewChatSheet";

export default function ChatRoomsScreen() {
  return <ChatRoomsList />;
}

// ─── Inner list ──────────────────────────────────────────────────────────────

const ALL_TAB: ChatRoomTag = {
  id: 0,
  name: "Все",
  color: colors.primary.blue[500],
};

function ChatRoomsList() {
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [newChatVisible, setNewChatVisible] = useState(false);

  const { data, isLoading, isFetching, refetch } =
    useGetChatRoomsQuery(undefined);

  const rooms = (data?.chat_rooms ?? []).filter((r) => r.other_member != null);

  const filteredRooms =
    selectedTagId === null
      ? rooms
      : rooms.filter((r) => r.other_member?.tag?.id === selectedTagId);

  // Collect unique tags from loaded rooms
  const tags = useMemo<ChatRoomTag[]>(() => {
    const seen = new Set<number>();
    const result: ChatRoomTag[] = [];
    rooms.forEach((r) => {
      const tag = r.other_member?.tag;
      if (tag && !seen.has(tag.id)) {
        seen.add(tag.id);
        result.push(tag);
      }
    });
    return result;
  }, [rooms]);

  const tabs = [ALL_TAB, ...tags];

  const onRoomPress = useCallback((room: ChatRoom) => {
    router.push(Routers.app.chat.room(room.id));
  }, []);

  if (isLoading) {
    return <ChatRoomsSkeleton />;
  }

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

            {/* Chat list */}
            {filteredRooms.length === 0 ? (
              <View
                className="flex-1 items-center justify-center gap-2"
                style={{
                  paddingBottom: bottomInset + 96,
                }}
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
                  <ChatRoomItem room={item} onPress={onRoomPress} />
                )}
                contentContainerStyle={{ paddingBottom: bottomInset + 16 }}
                refreshControl={
                  <RefreshControl
                    refreshing={isFetching && !isLoading}
                    onRefresh={refetch}
                  />
                }
                ItemSeparatorComponent={() => <View className="h-2" />}
              />
            )}
          </SafeAreaView>
        )}
      </ScreenWithToolbar>

      <NewChatSheet
        visible={newChatVisible}
        onClose={() => setNewChatVisible(false)}
      />
    </>
  );
}
