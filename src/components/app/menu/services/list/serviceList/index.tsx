import React, { useCallback, useMemo } from "react";
import { InfiniteFlashList } from "@/src/components/shared/list/infiniteFlashList";
import { ActivityIndicator, Text, View } from "react-native";
import { Button, Card, StSvg, Tag, Typography } from "@/src/components/ui";
import map from "lodash/map";
import { colors } from "@/src/styles/colors";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";

const ServiceList = () => {
  const auth = useRequiredAuth();

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetServiceCategoriesInfiniteQuery(
    auth
      ? { userId: auth.userId, params: { view: "with_services" } }
      : skipToken,
  );

  const categories = useMemo(() => {
    return data?.pages.flatMap((page) => page.service_categories) ?? [];
  }, [data]);

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    if (isFetchingNextPage) return;

    refetch({ refetchCachedPages: false });
  }, [isFetchingNextPage, refetch]);

  if (isLoading && !data) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View className="flex-1 items-center justify-center px-screen gap-4">
        <Text className="text-body text-accent-red-500">
          Ошибка загрузки категорий.
        </Text>
        <Button
          title="Повторить"
          onPress={handleRefresh}
          loading={isFetching}
          disabled={isFetching}
          buttonClassName="w-full"
        />
      </View>
    );
  }

  return (
    <InfiniteFlashList
      data={categories}
      scrollEnabled={false}
      keyExtractor={(item) => String(item.id)}
      showsVerticalScrollIndicator={false}
      onRefresh={handleRefresh}
      isRefreshing={isFetching && !isFetchingNextPage && !isLoading}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.35}
      hasNextPage={Boolean(hasNextPage)}
      isFetchingNextPage={isFetchingNextPage}
      contentContainerStyle={{
        paddingHorizontal: 20,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
      ListEmptyComponent={
        <View className="pt-6">
          <Typography className="text-neutral-500">
            Категорий пока нет.
          </Typography>
        </View>
      }
      renderItem={({ item: category }) => {
        const activeServicesCount =
          category.services?.filter((s) => s.is_active).length ?? 0;

        return (
          <View className="gap-2">
            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Typography className="text-caption text-neutral-500">
                  {category.name}
                </Typography>
              </View>

              <Typography
                weight="regular"
                className="text-caption text-neutral-500"
              >
                {activeServicesCount}/{category.services?.length ?? 0} активно
              </Typography>
            </View>

            <View className="gap-2">
              {category.services?.length ? (
                map(category.services, (service) => (
                  <Card
                    key={service.id}
                    title={service.name}
                    titleProps={{
                      numberOfLines: 1,
                      ellipsizeMode: "tail",
                    }}
                    subtitle={`${service.duration} мин | ${(
                      service.price_cents / 100
                    ).toLocaleString("ru-RU")} ₽`}
                    titleAccessory={
                      !service.is_active ? (
                        <Tag title="скрыто" size="sm" />
                      ) : undefined
                    }
                    right={
                      <StSvg
                        name="Expand_right_light"
                        size={24}
                        color={colors.neutral[500]}
                      />
                    }
                    onPress={() =>
                      router.push(
                        Routers.app.menu.services.edit(service.id, category.id),
                      )
                    }
                  />
                ))
              ) : (
                <Button
                  title="Создать услугу"
                  onPress={() =>
                    router.push(Routers.app.menu.services.create(category.id))
                  }
                  variant="secondary"
                  rightIcon={
                    <StSvg
                      name="Add_ring_fill_light"
                      size={18}
                      color={colors.neutral[900]}
                    />
                  }
                />
              )}
            </View>
          </View>
        );
      }}
    />
  );
};

export default ServiceList;
