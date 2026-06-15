import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  Share,
  View,
} from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, IconButton, StSvg, Typography } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/redux/store";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { useGetChatRoomsInfiniteQuery } from "@/src/store/redux/services/api/chatRoomsApi";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import ChatRoomItem from "./ChatRoomItem";
import ChatRoomsSkeleton from "./ChatRoomsSkeleton";
import { NewChatSheet } from "./NewChatSheet";
import { useRefresh } from "@/src/hooks/useRefresh";

const RoomSeparator = () => <View className="h-2" />;

export default function ChatRoomsScreen() {
  const [newChatVisible, setNewChatVisible] = useState(false);

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

  const user = useAppSelector((s) => s.auth.user);

  const handleShareLink = useCallback(async () => {
    if (!user?.nickname) return;
    const url = `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${user.nickname}`;
    await Share.share({ url, message: url });
  }, [user?.nickname]);

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
          ) : isError && !data ? (
            <ErrorScreen
              title="Не удалось загрузить чаты"
              isLoading={isFetching}
              onRetry={refetch}
            />
          ) : (
            <FlashList
              data={rooms}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ChatRoomItem
                  room={item}
                  onPress={() => router.push(Routers.app.chat.room(item.id))}
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
                flexGrow: 1,
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
              ListEmptyComponent={
                <View
                  className="flex-1 items-center justify-center gap-5 px-screen"
                  style={{ marginBottom: bottomInset + 8 }}
                >
                  <Image
                    style={{ width: 159, height: 142 }}
                    source={require("@/assets/images/app/chat-empty.png")}
                  />
                  <View className="gap-2">
                    <Typography
                      weight="semibold"
                      className="text-display text-center"
                    >
                      Клиенты ещё не писали
                    </Typography>
                    <Typography className="text-body text-neutral-500 text-center">
                      Поделись ссылкой чтобы они могли записаться и написать
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
