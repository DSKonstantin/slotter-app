import React, { useCallback, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { View, FlatList, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Avatar,
  Badge,
  Button,
  Card,
  StSvg,
  Typography,
} from "@/src/components/ui";
import {
  useGetCustomersQuery,
  useGetCustomerTagsQuery,
} from "@/src/store/redux/services/api/customersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { skipToken } from "@reduxjs/toolkit/query";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";
import type { Customer } from "@/src/store/redux/services/api-types";
import { useToolbarSearch } from "@/src/components/shared/layout/toolbarContext";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  selectClientsSearch,
  selectClientsTagId,
  setSearch,
  setTagId,
} from "@/src/store/redux/slices/clientsSlice";

const SEARCH_DEBOUNCE_MS = 300;

const ClientRow = React.memo(function ClientRow({ item }: { item: Customer }) {
  return (
    <Card
      title={item.name}
      subtitle={item.phone || undefined}
      left={<Avatar name={item.name} size="md" />}
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

  const [refreshing, setRefreshing] = useState(false);

  const { data: tagsData } = useGetCustomerTagsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

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

  useToolbarSearch({
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
      query: debouncedSearch || undefined,
    }),
    [debouncedSearch],
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useGetCustomersQuery(queryParams);

  const customers = useMemo(() => {
    const all = data?.customers ?? [];
    if (!tagId) return all;
    return all.filter((c) => c.customer_tag?.id === tagId);
  }, [data?.customers, tagId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <View className="flex-1" style={{ paddingTop: topInset }}>
      <View className="flex-row px-screen pb-3 gap-2">
        {filters.map((f) => (
          <Badge
            key={f.label}
            title={f.label}
            variant={tagId === f.value ? "accent" : "secondary"}
            onPress={() => dispatch(setTagId(f.value))}
          />
        ))}
      </View>

      <View className="flex-row gap-2.5 px-screen mb-5">
        <Button
          title="Статистика"
          buttonClassName="flex-1"
          rightIcon={
            <StSvg name="Pipe_fill" size={24} color={colors.neutral[0]} />
          }
          onPress={() => {}}
        />
        <Button
          title="Рассылка"
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

      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isError && !data ? (
        <View className="flex-1 items-center justify-center px-screen gap-4">
          <Typography className="text-body text-accent-red-500">
            Ошибка загрузки клиентов
          </Typography>
          <Button
            title="Повторить"
            onPress={handleRefresh}
            loading={isFetching}
            disabled={isFetching}
            buttonClassName="w-full"
          />
        </View>
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
          onRefresh={handleRefresh}
          refreshing={refreshing}
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
  const auth = useRequiredAuth();

  if (!auth) return null;

  return (
    <ScreenWithToolbar title="Клиенты">
      {({ topInset, bottomInset }) => (
        <ClientsContent topInset={topInset} bottomInset={bottomInset} />
      )}
    </ScreenWithToolbar>
  );
};

export default ClientsList;
