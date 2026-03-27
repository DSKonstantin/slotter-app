import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Avatar, Badge, Button, StSvg, Typography } from "@/src/components/ui";
import { useGetCustomersQuery } from "@/src/store/redux/services/api/customersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";
import type { Customer } from "@/src/store/redux/services/api-types";
import { useToolbarSearch } from "@/src/components/shared/layout/toolbarContext";

const FILTERS = [
  { label: "Все", value: undefined },
  { label: "Новые", value: "new" },
  { label: "Постоянные", value: "regular" },
];

const ClientRow = React.memo(function ClientRow({ item }: { item: Customer }) {
  return (
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
  );
});

type ClientsContentProps = {
  topInset: number;
  bottomInset: number;
  userId: number;
};

const ClientsContent = ({
  topInset,
  bottomInset,
  userId,
}: ClientsContentProps) => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | undefined>(
    undefined,
  );
  const [refreshing, setRefreshing] = useState(false);

  useToolbarSearch({
    placeholder: "Имя или телефон",
    onChange: setSearch,
  });

  const { data, isLoading, isError, refetch, isFetching } =
    useGetCustomersQuery({
      userId,
      params: { query: search || undefined },
    });

  const customers = useMemo(() => data?.customers ?? [], [data?.customers]);

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
      {/* Filters */}
      <View className="flex-row px-screen pb-3 gap-2">
        {FILTERS.map((f) => (
          <Badge
            key={f.label}
            title={f.label}
            variant={activeFilter === f.value ? "accent" : "secondary"}
            onPress={() => setActiveFilter(f.value)}
          />
        ))}
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
  );
};

const ClientsList = () => {
  const auth = useRequiredAuth();

  if (!auth) return null;

  return (
    <ScreenWithToolbar title="Клиенты">
      {({ topInset, bottomInset }) => (
        <ClientsContent
          topInset={topInset}
          bottomInset={bottomInset}
          userId={auth.userId}
        />
      )}
    </ScreenWithToolbar>
  );
};

export default ClientsList;
