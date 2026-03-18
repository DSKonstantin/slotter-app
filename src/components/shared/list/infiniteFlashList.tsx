import React, { useCallback } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import {
  FlashList,
  type FlashListProps,
  type ListRenderItem,
} from "@shopify/flash-list";

type InfiniteFlashListProps<TItem> = Omit<
  FlashListProps<TItem>,
  "data" | "renderItem" | "onEndReached" | "refreshControl"
> & {
  data: TItem[];
  renderItem: ListRenderItem<TItem>;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  refreshTintColor?: string;
  showDefaultFooterLoader?: boolean;
};

export function InfiniteFlashList<TItem>({
  data,
  renderItem,
  isRefreshing = false,
  onRefresh,
  onEndReached,
  isFetchingNextPage = false,
  hasNextPage = true,
  refreshTintColor = "blue",
  showDefaultFooterLoader = true,
  ListFooterComponent,
  ...rest
}: InfiniteFlashListProps<TItem>) {
  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    onEndReached?.();
  }, [hasNextPage, isFetchingNextPage, onEndReached]);

  const footer =
    ListFooterComponent ||
    (showDefaultFooterLoader && isFetchingNextPage ? (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    ) : null);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      onEndReached={handleEndReached}
      ListFooterComponent={footer}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            tintColor={refreshTintColor}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
      {...rest}
    />
  );
}
