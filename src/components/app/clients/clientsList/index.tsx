import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Avatar, Badge, Button, IconButton, StSvg, Typography } from "@/src/components/ui";
import { useGetCustomersQuery } from "@/src/store/redux/services/api/customersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";
import type { Customer } from "@/src/store/redux/services/api-types";

const FILTERS = [
  { label: "Все", value: undefined },
  { label: "Новые", value: "new" },
  { label: "Постоянные", value: "regular" },
];

const ClientRow = React.memo(({ item }: { item: Customer }) => (
  <Pressable
    className="flex-row items-center bg-white rounded-2xl p-4 min-h-[64px] active:opacity-70"
    onPress={() => router.push(Routers.app.clients.detail(item.id))}
  >
    <Avatar name={item.name} size="md" />
    <View className="flex-1 ml-3 gap-0.5">
      <Text className="font-inter-semibold text-body text-neutral-900">
        {item.name}
      </Text>
      {item.phone ? (
        <Text className="font-inter-regular text-caption text-neutral-500">
          {item.phone}
        </Text>
      ) : null}
    </View>
    {item.customer_tag ? (
      <View
        className="h-[26px] px-3 rounded-full items-center justify-center"
        style={{ backgroundColor: item.customer_tag.color + "22" }}
      >
        <Text
          className="font-inter-medium text-caption"
          style={{ color: item.customer_tag.color }}
        >
          {item.customer_tag.name}
        </Text>
      </View>
    ) : null}
  </Pressable>
));

const ClientsList = () => {
  const auth = useRequiredAuth();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | undefined>(
    undefined,
  );

  const { data, isLoading, isError, refetch, isFetching } = useGetCustomersQuery(
    auth
      ? {
          userId: auth.userId,
          params: { query: search || undefined },
        }
      : skipToken,
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!auth) return null;

  return (
    <ScreenWithToolbar
      title="Клиенты"
      rightButton={
        <IconButton
          icon={<StSvg name="Add_ring_fill" size={28} color={colors.neutral[900]} />}
          onPress={() => router.push(Routers.app.clients.create)}
          accessibilityLabel="Создать клиента"
        />
      }
    >
      {({ topInset, bottomInset }) => (
        <View className="flex-1" style={{ paddingTop: topInset }}>
          {/* Search */}
          <View className="px-screen pt-4 pb-2">
            <View className="flex-row items-center bg-white rounded-2xl px-4 h-[48px] border border-background gap-2">
              <StSvg name="Search" size={20} color={colors.neutral[400]} />
              <TextInput
                className="flex-1 font-inter-regular text-body text-neutral-900"
                placeholder="Поиск по имени или телефону"
                placeholderTextColor={colors.neutral[400]}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <StSvg name="close_ring_fill_light" size={20} color={colors.neutral[400]} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Filters */}
          <View className="flex-row px-screen pb-3 gap-2">
            {FILTERS.map((f) => (
              <Badge
                key={f.label}
                title={f.label}
                variant={activeFilter === f.value ? "primary" : "secondary"}
                size="sm"
                onPress={() => setActiveFilter(f.value)}
              />
            ))}
          </View>

          {/* List */}
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
              data={data?.customers ?? []}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: bottomInset + 16,
                gap: 8,
              }}
              showsVerticalScrollIndicator={false}
              onRefresh={handleRefresh}
              refreshing={isFetching && !isLoading}
              renderItem={({ item }) => <ClientRow item={item} />}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center pt-20 gap-4">
                  <StSvg name="User_fill" size={48} color={colors.neutral[300]} />
                  <Typography className="text-body text-neutral-500 text-center">
                    {search ? "Клиентов не найдено" : "Список клиентов пуст"}
                  </Typography>
                  {!search && (
                    <Button
                      title="Добавить клиента"
                      variant="secondary"
                      onPress={() => router.push(Routers.app.clients.create)}
                    />
                  )}
                </View>
              }
            />
          )}
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default ClientsList;
