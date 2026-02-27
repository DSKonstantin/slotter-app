import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";

import {
  Button,
  Card,
  IconButton,
  StSvg,
  Tag,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { InfiniteFlashList } from "@/src/components/shared/list/infiniteFlashList";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";

const AppServices = () => {
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

  const createService = useCallback(() => {
    router.push(Routers.app.menu.services.create());
  }, []);

  const createCategories = useCallback(() => {
    router.push(Routers.app.menu.services.categories);
  }, []);

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    if (isFetchingNextPage) return;

    refetch({ refetchCachedPages: false });
  }, [isFetchingNextPage, refetch]);

  if (!auth) {
    return null;
  }

  return (
    <ScreenWithToolbar
      title="Услуги"
      rightButton={
        <IconButton
          disabled={isLoading}
          onPress={() => {}}
          icon={<StSvg name="Search" size={24} color={colors.neutral[900]} />}
        />
      }
    >
      {({ topInset, bottomInset }) => {
        if (isLoading && !data) {
          return (
            <View
              className="flex-1 items-center justify-center"
              style={{ marginTop: topInset, marginBottom: bottomInset }}
            >
              <ActivityIndicator />
            </View>
          );
        }

        if (isError && !data) {
          return (
            <View
              className="flex-1 items-center justify-center px-screen gap-4"
              style={{ marginTop: topInset, marginBottom: bottomInset }}
            >
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
          <>
            <View
              className="flex-row gap-2.5 px-screen pb-4"
              style={{ marginTop: topInset }}
            >
              <Button
                title="Создать услугу"
                onPress={createService}
                rightIcon={
                  <StSvg
                    name="Add_ring_fill"
                    size={24}
                    color={colors.neutral[0]}
                  />
                }
                buttonClassName="flex-1"
              />
              <Button
                title="Категории"
                variant="secondary"
                textVariant="accent"
                onPress={createCategories}
                buttonClassName="flex-1"
                rightIcon={
                  <StSvg
                    name="File_dock_search_fill"
                    size={24}
                    color={colors.primary.blue[500]}
                  />
                }
              />
            </View>

            <InfiniteFlashList
              data={categories}
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
                paddingBottom: bottomInset + 60,
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
                      <Typography className="text-caption text-neutral-500">
                        {category.name}
                      </Typography>

                      <Typography
                        weight="regular"
                        className="text-caption text-neutral-500"
                      >
                        {activeServicesCount}/{category.services?.length ?? 0}{" "}
                        активно
                      </Typography>
                    </View>

                    <View className="gap-2">
                      {category.services?.length ? (
                        category.services.map((service) => (
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
                                Routers.app.menu.services.edit(
                                  service.id,
                                  category.id,
                                ),
                              )
                            }
                          />
                        ))
                      ) : (
                        <Button
                          title="Создать услугу"
                          onPress={() =>
                            router.push(
                              Routers.app.menu.services.create(category.id),
                            )
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
          </>
        );
      }}
    </ScreenWithToolbar>
  );
};

export default AppServices;
