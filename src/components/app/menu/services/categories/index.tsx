import React, { useCallback, useMemo, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { toast } from "@backpackapp-io/react-native-toast";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { skipToken } from "@reduxjs/toolkit/query";

import { Button, IconButton, StSvg, Typography } from "@/src/components/ui";
import ErrorScreen from "@/src/components/shared/errorScreen";

import { colors } from "@/src/styles/colors";

import {
  useGetServiceCategoriesInfiniteQuery,
  useReorderServiceCategoriesMutation,
  useUpdateServiceCategoryMutation,
} from "@/src/store/redux/services/api/servicesApi";
import type { ServiceCategory } from "@/src/store/redux/services/api-types";

import CreateCategoryModal from "@/src/components/app/menu/services/categories/createCategoryModal";
import EditCategoryModal from "@/src/components/app/menu/services/categories/editCategoryModal";
import CategoryItemCard from "@/src/components/app/menu/services/categories/categoryItemCard";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useInfiniteListConfig } from "@/src/hooks/useInfiniteListConfig";
import { getApiErrorMessage } from "@/src/utils/apiError";

type SelectedCategory = {
  id: number;
  name: string;
  color?: string | null;
};

const AppServicesCategories = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<SelectedCategory | null>(null);
  const [updateServiceCategory] = useUpdateServiceCategoryMutation();
  const [reorderServiceCategories] = useReorderServiceCategoriesMutation();
  const auth = useRequiredAuth();
  const listConfig = useInfiniteListConfig({ includeFlexGrow: true });
  const {
    data,
    refetch,
    isLoading,
    isFetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetServiceCategoriesInfiniteQuery(
    auth
      ? { userId: auth.userId, params: { view: "public_profile" } }
      : skipToken,
  );
  const categories = useMemo(() => {
    if (!data?.pages) return [];

    const unique = new Map<number, ServiceCategory>();

    data.pages.forEach((page) => {
      page.service_categories.forEach((category) => {
        unique.set(category.id, category);
      });
    });

    return [...unique.values()];
  }, [data?.pages]);

  const handleToggleCategoryActive = (
    categoryId: number,
    nextValue: boolean,
  ) => {
    if (auth?.userId == null) return;

    updateServiceCategory({
      userId: auth.userId,
      id: categoryId,
      data: { is_active: nextValue },
    }).unwrap();
  };

  const handleDragEnd = useCallback(
    async ({
      data: nextData,
      from,
      to,
    }: {
      data: ServiceCategory[];
      from: number;
      to: number;
    }) => {
      if (from === to || auth?.userId == null) return;

      try {
        await reorderServiceCategories({
          userId: auth.userId,
          positions: nextData.map((category, index) => ({
            id: category.id,
            position: index,
          })),
        }).unwrap();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Не удалось изменить порядок категорий"),
        );
      }
    },
    [auth?.userId, reorderServiceCategories],
  );

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    if (isFetchingNextPage) return Promise.resolve();

    setRefreshing(true);

    return refetch({ refetchCachedPages: false }).finally(() => {
      setRefreshing(false);
    });
  }, [isFetchingNextPage, refetch]);

  if (!auth) {
    return null;
  }

  return (
    <>
      <ScreenWithToolbar title="Категории услуг">
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
              <ErrorScreen
                title="Не удалось загрузить категории"
                isLoading={isFetching}
                withTabBar={false}
                onRetry={handleRefresh}
              />
            );
          }
          return (
            <View className="flex-1">
              <DraggableFlatList
                data={categories}
                contentContainerStyle={{
                  ...listConfig.contentContainerStyle,
                  paddingTop: topInset,
                  paddingBottom: bottomInset + 16,
                }}
                ListHeaderComponent={
                  <Typography className="text-caption text-neutral-500 mb-2">
                    Существующие категории
                  </Typography>
                }
                keyExtractor={(item) => String(item.id)}
                activationDistance={listConfig.activationDistance}
                autoscrollThreshold={listConfig.autoscrollThreshold}
                autoscrollSpeed={listConfig.autoscrollSpeed}
                onDragEnd={handleDragEnd}
                onEndReached={handleEndReached}
                onEndReachedThreshold={listConfig.onEndReachedThreshold}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                renderItem={({
                  item,
                  drag,
                  isActive,
                }: RenderItemParams<ServiceCategory>) => (
                  <CategoryItemCard
                    item={item}
                    drag={drag}
                    isActive={isActive}
                    onToggleActive={handleToggleCategoryActive}
                    onPress={(category) => {
                      setSelectedCategory(category);
                      setEditModalVisible(true);
                    }}
                  />
                )}
                ListFooterComponent={
                  <View className="gap-2">
                    {isFetchingNextPage ? (
                      <View className="items-center py-2">
                        <ActivityIndicator />
                      </View>
                    ) : null}
                    <Button
                      title="Создать новую категорию"
                      variant="clear"
                      onPress={() => setCreateModalVisible(true)}
                      rightIcon={
                        <StSvg
                          name="Add_ring_fill_light"
                          size={18}
                          color={colors.neutral[900]}
                        />
                      }
                    />
                  </View>
                }
              />
            </View>
          );
        }}
      </ScreenWithToolbar>

      <CreateCategoryModal
        visible={createModalVisible}
        userId={auth.userId}
        onClose={() => setCreateModalVisible(false)}
      />
      <EditCategoryModal
        visible={editModalVisible}
        userId={auth.userId}
        category={selectedCategory}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedCategory(null);
        }}
      />
    </>
  );
};

export default React.memo(AppServicesCategories);
