import React, { useCallback, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | undefined>(
    undefined,
  );
  const [refreshing, setRefreshing] = useState(false);

  const { data: tagsData } = useGetCustomerTagsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const filters = useMemo(
    () => [
      { label: "Все", value: undefined },
      ...(tagsData?.customer_tags ?? []).map((t) => ({
        label: t.name,
        value: String(t.id),
      })),
    ],
    [tagsData?.customer_tags],
  );

  useToolbarSearch({
    placeholder: "Имя или телефон",
    onChange: setSearch,
  });

  const { data, isLoading, isError, refetch, isFetching } =
    useGetCustomersQuery();

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
      <View className="flex-row px-screen pb-3 gap-2">
        {filters.map((f) => (
          <Badge
            key={f.label}
            title={f.label}
            variant={activeFilter === f.value ? "accent" : "secondary"}
            onPress={() => setActiveFilter(f.value)}
          />
        ))}
      </View>

      <View className="flex-row gap-2.5 px-screen mb-5">
        <Button
          title="Статистика"
          buttonClassName="flex-1"
          onPress={() => {}}
        />
        <Button
          title="Рассылка"
          variant="clear"
          buttonClassName="flex-1"
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
        <ClientsContent topInset={topInset} bottomInset={bottomInset} />
      )}
    </ScreenWithToolbar>
  );
};

export default ClientsList;
