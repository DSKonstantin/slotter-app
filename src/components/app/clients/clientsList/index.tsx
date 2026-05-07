import React, { useCallback, useMemo, useRef, useState } from "react";
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
  StSvg,
  Typography,
} from "@/src/components/ui";
import { useGetCustomerTagsQuery } from "@/src/store/redux/services/api/customersApi";
import { useGetUserCustomersPaginatedInfiniteQuery } from "@/src/store/redux/services/api/userCustomersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { skipToken } from "@reduxjs/toolkit/query";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";
import type { UserCustomer } from "@/src/store/redux/services/api-types";
import { useToolbarSearch } from "@/src/components/shared/layout/toolbarContext";
import { useRefresh } from "@/src/hooks/useRefresh";
import RetryInline from "@/src/components/shared/retryInline";
import ClientsToolbarButton from "./ClientsToolbarButton";
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
}: {
  item: UserCustomer;
}) {
  return (
    <Card
      title={item.customer.name}
      titleProps={{
        numberOfLines: 2,
      }}
      subtitle={item.customer.phone || undefined}
      left={
        <Avatar
          name={item.customer.name}
          uri={item.customer.avatar_url ?? undefined}
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

  const debouncedSetSearch = useRef(
    debounce((value: string) => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS),
  ).current;

  const {
    data: tagsData,
    isError: isTagsError,
    refetch: refetchTags,
  } = useGetCustomerTagsQuery(auth ? { userId: auth.userId } : skipToken);

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
    },
  });

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

  const customers = useMemo(() => {
    if (!data?.pages) return [];
    const unique = new Map<number, UserCustomer>();
    data.pages.forEach((page) => {
      page.user_customers.forEach((uc) => unique.set(uc.id, uc));
    });
    return [...unique.values()];
  }, [data?.pages]);

  return (
    <View className="flex-1" style={{ paddingTop: topInset }}>
      {!searchMode && (
        <>
          <FlatList
            horizontal
            data={filters}
            keyExtractor={(f) => f.label}
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            className="pb-3"
            renderItem={({ item: f }) => (
              <Badge
                title={f.label}
                variant={tagId === f.value ? "accent" : "secondary"}
                onPress={() => handleSetTagId(f.value)}
              />
            )}
          />
          {isTagsError && (
            <View className="px-screen pb-3">
              <RetryInline
                text="Не удалось загрузить теги"
                buttonText="Обновить"
                onRetry={refetchTags}
              />
            </View>
          )}

          <View className="flex-row gap-2.5 px-screen mb-5">
            <Button
              title="Статистика"
              buttonClassName="flex-1"
              rightIcon={
                <StSvg name="Pipe_fill" size={24} color={colors.neutral[0]} />
              }
              onPress={() => router.push(Routers.app.clients.statistics)}
            />
            <Button
              title="Рассылка"
              disabled
              variant="clear"
              buttonClassName="flex-1"
              rightIcon={
                <StSvg
                  name="Message_alt_fill"
                  size={24}
                  color={colors.neutral[900]}
                />
              }
              onPress={() => {}}
            />
          </View>
        </>
      )}

      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isError && !data ? (
        <ErrorScreen
          title="Не удалось загрузить клиентов"
          isLoading={isFetching}
          onRetry={onRefresh}
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: bottomInset + 16,
            gap: 8,
            flexGrow: customers.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => <ClientRow item={item} />}
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
    </View>
  );
};

const ClientsList = () => {
  return (
    <ScreenWithToolbar
      title="Клиенты"
      rightButton={(toolbar) => <ClientsToolbarButton toolbar={toolbar} />}
    >
      {({ topInset, bottomInset }) => (
        <ClientsContent topInset={topInset} bottomInset={bottomInset} />
      )}
    </ScreenWithToolbar>
  );
};

export default ClientsList;
