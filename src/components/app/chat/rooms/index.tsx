import React, { useMemo, useState } from "react";
import { RefreshControl, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useGetChatRoomsQuery } from "@/src/store/redux/services/api/chatRoomsApi";
import ChatRoomItem from "./ChatRoomItem";
import ChatRoomsSkeleton from "./ChatRoomsSkeleton";
import { NewChatSheet } from "./NewChatSheet";
import { useRefresh } from "@/src/hooks/useRefresh";

const RoomSeparator = () => <View className="h-2" />;

export default function ChatRoomsScreen() {
  const [newChatVisible, setNewChatVisible] = useState(false);

  const { data, isLoading, refetch } = useGetChatRoomsQuery(undefined);

  const { refreshing, onRefresh } = useRefresh(refetch);

  const rooms = useMemo(
    () => (data?.rooms ?? []).filter((r) => r.interlocutor != null),
    [data],
  );

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
        {({ topInset, bottomInset }) =>
          isLoading ? (
            <ChatRoomsSkeleton topInset={topInset} />
          ) : (
            <View className="flex-1">
              {rooms.length === 0 ? (
                <View
                  className="flex-1 items-center justify-center gap-2"
                  style={{
                    paddingTop: topInset,
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
                  data={rooms}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <ChatRoomItem
                      room={item}
                      onPress={() =>
                        router.push(Routers.app.chat.room(item.id))
                      }
                    />
                  )}
                  contentContainerStyle={{
                    paddingTop: topInset,
                    paddingBottom: bottomInset + 16,
                    paddingHorizontal: 20,
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  ItemSeparatorComponent={RoomSeparator}
                />
              )}
            </View>
          )
        }
      </ScreenWithToolbar>

      <NewChatSheet
        visible={newChatVisible}
        onClose={() => setNewChatVisible(false)}
      />
    </>
  );
}
