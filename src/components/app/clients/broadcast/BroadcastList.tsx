import React, { useCallback, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import debounce from "lodash/debounce";
import { router } from "expo-router";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useToolbarSearch } from "@/src/components/shared/layout/toolbarContext";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { InfiniteFlashList } from "@/src/components/shared/list/infiniteFlashList";
import {
  Badge,
  Button,
  FloatingFooter,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import { useGetMarketingBroadcastsPaginatedInfiniteQuery } from "@/src/store/redux/services/api/marketingBroadcastsApi";
import type { MarketingBroadcast } from "@/src/store/redux/services/api-types";
import BroadcastCard from "./BroadcastCard";
import { useBroadcastGate } from "./useBroadcastGate";

const SEARCH_DEBOUNCE_MS = 300;

type BroadcastFilter = "all" | "scheduled" | "completed";

const STATUS_PARAMS: Record<BroadcastFilter, string | undefined> = {
  all: undefined,
  scheduled: "preparing,scheduled,running,paused",
  completed: "completed,cancelled",
};

const BROADCAST_FILTERS: { label: string; value: BroadcastFilter }[] = [
  { label: "Все", value: "all" },
  { label: "Запланированные", value: "scheduled" },
  { label: "Завершённые", value: "completed" },
];

type ContentProps = {
  topInset: number;
  bottomInset: number;
};

const Separator = () => <View className="h-3" />;

const BroadcastContent = ({ topInset, bottomInset }: ContentProps) => {
  const auth = useRequiredAuth();
  const [filter, setFilter] = useState<BroadcastFilter>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { guard, isLoading: gateLoading, modal } = useBroadcastGate();

  const debouncedSetSearch = useRef(
    debounce((value: string) => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS),
  ).current;

  const { searchMode } = useToolbarSearch({
    placeholder: "Название или текст",
    onChange: (value) => debouncedSetSearch(value),
    onClose: () => {
      debouncedSetSearch.cancel();
      setDebouncedSearch("");
    },
  });

  const queryParams = useMemo(
    () => ({
      userId: auth!.userId,
      status: STATUS_PARAMS[filter],
      query: debouncedSearch || undefined,
    }),
    [auth, filter, debouncedSearch],
  );

  const {
    data,
    isLoading,
    isError,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useGetMarketingBroadcastsPaginatedInfiniteQuery(queryParams);

  const items = useMemo(() => {
    if (!data?.pages) return [];
    const unique = new Map<number, MarketingBroadcast>();
    data.pages.forEach((page) => {
      page.marketing_broadcasts.forEach((b) => unique.set(b.id, b));
    });
    return [...unique.values()];
  }, [data?.pages]);

  const handleRefresh = useCallback(
    () => refetch({ refetchCachedPages: false }),
    [refetch],
  );

  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: MarketingBroadcast }) => <BroadcastCard item={item} />,
    [],
  );

  if (isError && !data) {
    return (
      <ErrorScreen
        title="Не удалось загрузить рассылки"
        isLoading={isFetching}
        onRetry={onRefresh}
      />
    );
  }

  return (
    <>
      <InfiniteFlashList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        showsVerticalScrollIndicator={false}
        isRefreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleEndReached}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        contentContainerStyle={{
          paddingTop: topInset,
          paddingBottom: bottomInset + 120,
          paddingHorizontal: SCREEN_PADDING,
        }}
        ListHeaderComponent={
          searchMode ? null : (
            <View className="flex-row flex-wrap gap-2 pb-3">
              {BROADCAST_FILTERS.map(({ label, value }) => (
                <Badge
                  key={value}
                  title={label}
                  variant={value === filter ? "accent" : "ghost"}
                  onPress={() => setFilter(value)}
                />
              ))}
            </View>
          )
        }
        ListEmptyComponent={
          isLoading ? null : (
            <Typography className="text-body text-neutral-400 text-center mt-10">
              Рассылок пока нет
            </Typography>
          )
        }
      />

      <FloatingFooter offset={bottomInset + 8}>
        <Button
          title="Создать новую рассылку"
          variant="accent"
          disabled={gateLoading}
          onPress={() =>
            guard(() => router.push(Routers.app.clients.broadcastCreate))
          }
          rightIcon={
            <StSvg name="Add_round_fill" size={24} color={colors.neutral[0]} />
          }
        />
      </FloatingFooter>

      {modal}
    </>
  );
};

const BroadcastList = () => (
  <ScreenWithToolbar
    title="Ваши рассылки"
    fallbackHref={Routers.app.clients.root}
    rightButton={(toolbar) => (
      <IconButton
        onPress={toolbar?.openSearch}
        accessibilityLabel="Поиск"
        icon={<StSvg name="Search" size={28} color={colors.neutral[900]} />}
      />
    )}
  >
    {({ topInset, bottomInset }) => (
      <BroadcastContent topInset={topInset} bottomInset={bottomInset} />
    )}
  </ScreenWithToolbar>
);

export default BroadcastList;
