import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { useGetChatRoomsInfiniteQuery } from "@/src/store/redux/services/api/chatRoomsApi";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import ChatRoomItem from "./ChatRoomItem";
import ChatRoomsSkeleton from "./ChatRoomsSkeleton";
import { useRefresh } from "@/src/hooks/useRefresh";

const RoomSeparator = () => <View className="h-2" />;

export default function ChatRoomsScreen() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetChatRoomsInfiniteQuery({});

  const { refreshing, onRefresh } = useRefresh(refetch);

  const rooms = useMemo(
    () =>
      (data?.pages.flatMap((p) => p.rooms) ?? []).filter(
        (r) => r.interlocutor != null,
      ),
    [data],
  );

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <ScreenWithToolbar
        title="Чаты"
        showBack={false}
      >
        {({ topInset, bottomInset }) =>
          isLoading ? (
            <ChatRoomsSkeleton topInset={topInset} />
          ) : isError && !data ? (
            <ErrorScreen
              title="Не удалось загрузить чаты"
              isLoading={isFetching}
              onRetry={refetch}
            />
          ) : (
            <View className="flex-1">
              {rooms.length === 0 ? (
                <View
                  className="flex-1 items-center justify-center gap-2"
                  style={{
                    paddingTop: topInset,
                    paddingBottom: bottomInset + 49,
                  }}
                >
                  <Typography
                    weight="semibold"
                    className="text-neutral-900 text-body"
                  >
                    Нет чатов
                  </Typography>
                  <Typography className="text-neutral-500 text-caption">
                    Начните переписку с мастером
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
                  maintainVisibleContentPosition={{
                    disabled: true,
                  }}
                  contentInset={
                    Platform.OS === "ios" ? { top: topInset } : undefined
                  }
                  contentOffset={
                    Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
                  }
                  contentContainerStyle={{
                    paddingTop: Platform.OS === "ios" ? 0 : topInset,
                    paddingBottom: bottomInset + 8,
                    paddingHorizontal: SCREEN_PADDING,
                  }}
                  refreshControl={
                    <RefreshControl
                      progressViewOffset={Platform.select({
                        android: topInset,
                      })}
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  ItemSeparatorComponent={RoomSeparator}
                  onEndReached={handleEndReached}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    isFetchingNextPage ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator color={colors.neutral[400]} />
                      </View>
                    ) : null
                  }
                />
              )}
            </View>
          )
        }
      </ScreenWithToolbar>
    </>
  );
}
