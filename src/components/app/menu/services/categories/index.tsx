import React, { useCallback, useMemo, useState } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { skipToken } from "@reduxjs/toolkit/query";

import {
  Button,
  Card,
  IconButton,
  StSvg,
  Typography,
  Switch,
} from "@/src/components/ui";

import { colors } from "@/src/styles/colors";

import {
  useGetServiceCategoriesInfiniteQuery,
  useReorderServiceCategoriesMutation,
  useUpdateServiceCategoryMutation,
} from "@/src/store/redux/services/api/servicesApi";
import type { ServiceCategory } from "@/src/store/redux/services/api-types";

import CreateCategoryModal from "@/src/components/app/menu/services/categories/createCategoryModal";
import EditCategoryModal from "@/src/components/app/menu/services/categories/editCategoryModal";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";

type SelectedCategory = {
  id: number;
  name: string;
  color?: string | null;
};

const AppServicesCategories = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<SelectedCategory | null>(null);
  const [updateServiceCategory] = useUpdateServiceCategoryMutation();
  const [reorderServiceCategories] = useReorderServiceCategoriesMutation();
  const auth = useRequiredAuth();
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
      ? { userId: auth.userId, params: { view: "with_services" } }
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

  const handleDragEnd = async ({
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
    } catch {}
  };

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
    <>
      <ScreenWithToolbar
        title="Категории услуг"
        rightButton={
          <IconButton
            icon={<StSvg name="Search" size={28} color={colors.neutral[900]} />}
            onPress={() => {}}
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
                <Typography className="text-body text-accent-red-500">
                  Ошибка загрузки категорий.
                </Typography>
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
            <View className="flex-1">
              <DraggableFlatList
                data={categories}
                contentContainerStyle={{
                  paddingTop: topInset,
                  paddingBottom: bottomInset + 16,
                  paddingHorizontal: 20,
                  flexGrow: 1,
                  gap: 8,
                }}
                ListHeaderComponent={
                  <Typography className="text-caption text-neutral-500 mb-2">
                    Существующие категории
                  </Typography>
                }
                keyExtractor={(item) => String(item.id)}
                activationDistance={10}
                autoscrollThreshold={48}
                autoscrollSpeed={220}
                onDragEnd={handleDragEnd}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.35}
                renderItem={({
                  item,
                  drag,
                  isActive,
                }: RenderItemParams<ServiceCategory>) => (
                  <Card
                    title={item.name}
                    pressArea="content"
                    active={isActive}
                    className={item.is_active ? "" : "opacity-40"}
                    subtitle={`${item.activeServicesCount ?? item.services?.length ?? 0} услуг`}
                    left={
                      <Pressable
                        onLongPress={drag}
                        delayLongPress={100}
                        hitSlop={8}
                      >
                        <View className="flex-row items-center gap-2">
                          <StSvg
                            name="Drag"
                            size={24}
                            color={colors.neutral[900]}
                          />
                          {item.color && (
                            <View
                              className={"w-5 h-5 rounded-full"}
                              style={{ backgroundColor: item.color }}
                            />
                          )}
                        </View>
                      </Pressable>
                    }
                    right={
                      <Switch
                        value={item.is_active}
                        onChange={(nextValue) =>
                          handleToggleCategoryActive(item.id, nextValue)
                        }
                      />
                    }
                    onPress={() => {
                      setSelectedCategory(item);
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

export default AppServicesCategories;
