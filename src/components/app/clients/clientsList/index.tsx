import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import debounce from "lodash/debounce";
import { View, FlatList, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import {
  Avatar,
  Badge,
  Button,
  Card,
  HighlightText,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { useGetCustomerTagsQuery } from "@/src/store/redux/services/api/customersApi";
import { useGetUserCustomersPaginatedInfiniteQuery } from "@/src/store/redux/services/api/userCustomersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { skipToken } from "@reduxjs/toolkit/query";
import { Routers } from "@/src/constants/routers";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { colors } from "@/src/styles/colors";
import type { UserCustomer } from "@/src/store/redux/services/api-types";
import { useToolbarSearch } from "@/src/components/shared/layout/toolbarContext";
import { useRefresh } from "@/src/hooks/useRefresh";
import ComingSoonModal from "@/src/components/shared/modals/ComingSoonModal";
import RetryInline from "@/src/components/shared/retryInline";
import ClientsToolbarButton from "./ClientsToolbarButton";
import ClientsListSkeleton from "./ClientsListSkeleton";
import ClientsFiltersSkeleton from "./ClientsFiltersSkeleton";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  selectClientsSearch,
  selectClientsTagId,
  setSearch,
  setTagId,
} from "@/src/store/redux/slices/clientsSlice";

const SEARCH_DEBOUNCE_MS = 300;

const ClientRow = React.memo(function ClientRow({
  item,
  highlight,
}: {
  item: UserCustomer;
  highlight?: string;
}) {
  return (
    <Card
      title={item.customer.name}
      titleNode={
        highlight ? (
          <HighlightText
            text={item.customer.name}
            numberOfLines={4}
            highlight={highlight}
            className="flex-shrink font-inter-medium text-body text-neutral-900"
          />
        ) : undefined
      }
      titleProps={{
        numberOfLines: 4,
      }}
      subtitle={
        highlight && item.customer.phone ? (
          <HighlightText
            text={item.customer.phone}
            highlight={highlight}
            className="font-inter-medium text-caption text-neutral-500"
          />
        ) : (
          item.customer.phone || undefined
        )
      }
      left={
        <Avatar
          name={item.customer.name}
          uri={item.customer.avatar_url ?? undefined}
          blurhash={item.customer.avatar_blurhash}
          size="md"
        />
      }
      right={
        <StSvg
          name="Expand_right_light"
          size={24}
          color={colors.neutral[500]}
        />
      }
      onPress={() => router.push(Routers.app.clients.detail(item.id))}
    />
  );
});

type ClientsContentProps = {
  topInset: number;
  bottomInset: number;
};

const ClientsContent = ({ topInset, bottomInset }: ClientsContentProps) => {
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();

  const search = useAppSelector(selectClientsSearch);
  const tagId = useAppSelector(selectClientsTagId);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  const debouncedSetSearch = useRef(
    debounce((value: string) => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS),
  ).current;
  const savedTagIdRef = useRef<number | undefined>(undefined);

  const {
    data: tagsData,
    isLoading: isTagsLoading,
    isError: isTagsError,
    refetch: refetchTags,
  } = useGetCustomerTagsQuery(auth ? { userId: auth.userId } : skipToken);

  const { searchMode } = useToolbarSearch({
    placeholder: "Имя или телефон",
    onChange: (value) => {
      dispatch(setSearch(value));
      debouncedSetSearch(value);
    },
    onClose: () => {
      debouncedSetSearch.cancel();
      dispatch(setSearch(""));
      setDebouncedSearch("");
      dispatch(setTagId(savedTagIdRef.current));
    },
  });

  const filters = useMemo(
    () => [
      { label: "Все", value: undefined },
      ...(tagsData?.customer_tags ?? []).map((t) => ({
        label: t.name,
        value: t.id,
      })),
    ],
    [tagsData?.customer_tags],
  );

  const queryParams = useMemo(
    () => ({
      userId: auth!.userId,
      query: debouncedSearch || undefined,
      customer_tag_id: tagId,
    }),
    [auth, debouncedSearch, tagId],
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
  } = useGetUserCustomersPaginatedInfiniteQuery(queryParams);

  const customers = useMemo(() => {
    if (!data?.pages) return [];
    const unique = new Map<number, UserCustomer>();
    data.pages.forEach((page) => {
      page.user_customers.forEach((uc) => unique.set(uc.id, uc));
    });
    return [...unique.values()];
  }, [data?.pages]);

  const handleRefresh = useCallback(() => {
    return refetch({ refetchCachedPages: false });
  }, [refetch]);

  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  const handleSetTagId = useCallback(
    (value?: number) => dispatch(setTagId(value)),
    [dispatch],
  );

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (searchMode) {
      savedTagIdRef.current = tagId;
      dispatch(setTagId(undefined));
    }
    // tagId intentionally excluded: capture only at the moment search opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMode, dispatch]);

  return (
    <View className="flex-1 gap-4" style={{ paddingTop: topInset }}>
      {!searchMode && (
        <>
          {isTagsError ? (
            <View className="px-screen h-[36px] justify-center">
              <RetryInline
                text="Не удалось загрузить теги"
                buttonText="Обновить"
                onRetry={refetchTags}
              />
            </View>
          ) : isTagsLoading && !tagsData ? (
            <ClientsFiltersSkeleton />
          ) : (
            <FlatList
              horizontal
              data={filters}
              keyExtractor={(f) => f.label}
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_PADDING,
                gap: 8,
              }}
              renderItem={({ item: f }) => (
                <Badge
                  title={f.label}
                  variant={tagId === f.value ? "accent" : "secondary"}
                  onPress={() => handleSetTagId(f.value)}
                />
              )}
            />
          )}
        </>
      )}

      {isLoading && !data ? (
        <ClientsListSkeleton bottomInset={bottomInset} />
      ) : isError && !data ? (
        <ErrorScreen
          title="Не удалось загрузить клиентов"
          isLoading={isFetching}
          onRetry={onRefresh}
        />
      ) : (
        <FlatList
          data={customers}
          style={{ flex: 1 }}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingBottom: bottomInset + 8,
            gap: 8,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            !searchMode ? (
              <View className="flex-row gap-2.5 pb-2">
                <Button
                  title="Статистика"
                  buttonClassName="flex-1"
                  rightIcon={
                    <StSvg
                      name="Pipe_fill"
                      size={24}
                      color={colors.neutral[0]}
                    />
                  }
                  onPress={() => router.push(Routers.app.clients.statistics)}
                />
                <Button
                  title="Рассылка"
                  variant="clear"
                  buttonClassName="flex-1 opacity-40"
                  rightIcon={
                    <StSvg
                      name="Message_alt_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  onPress={() => setComingSoonVisible(true)}
                />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ClientRow item={item} highlight={debouncedSearch || undefined} />
          )}
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
            <View className="flex-1 items-center justify-center gap-4">
              <StSvg name="Chat_search" size={60} color={colors.neutral[400]} />
              <Typography className="text-body text-neutral-500 text-center">
                И близко ничего не нашли
              </Typography>
            </View>
          }
        />
      )}

      <ComingSoonModal
        visible={comingSoonVisible}
        onClose={() => setComingSoonVisible(false)}
      />
    </View>
  );
};

const ClientsList = () => {
  return (
    <ScreenWithToolbar
      title="Клиенты"
      showBack={false}
      rightButton={(toolbar) => <ClientsToolbarButton toolbar={toolbar} />}
    >
      {({ topInset, bottomInset }) => (
        <ClientsContent topInset={topInset} bottomInset={bottomInset} />
      )}
    </ScreenWithToolbar>
  );
};

export default ClientsList;
