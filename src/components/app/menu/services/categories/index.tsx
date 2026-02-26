import React, { useEffect, useMemo, useState } from "react";
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

import CreateCategoryModal from "@/src/components/app/menu/services/createCategoryModal";
import EditCategoryModal from "@/src/components/app/menu/services/editCategoryModal";
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
  const userId = auth?.userId;
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetServiceCategoriesInfiniteQuery(
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

    return [...unique.values()].sort((a, b) => a.position - b.position);
  }, [data?.pages]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleToggleCategoryActive = (
    categoryId: number,
    nextValue: boolean,
  ) => {
    if (userId == null) return;

    updateServiceCategory({
      userId,
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
    if (from === to || userId == null) return;

    try {
      await reorderServiceCategories({
        userId,
        positions: nextData.map((category, index) => ({
          id: category.id,
          position: index,
        })),
      }).unwrap();
    } catch {}
  };

  if (isLoading && categories.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

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
        {({ topInset, bottomInset }) => (
          <View className="flex-1">
            <DraggableFlatList
              data={categories}
              contentContainerStyle={{
                paddingTop: topInset,
                paddingBottom: bottomInset + 16,
                paddingHorizontal: 20,
                // flexGrow: 1,
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
                      // disabled={updatingCategoryIds.includes(item.id)}
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
              }
            />
          </View>
        )}
      </ScreenWithToolbar>

      <CreateCategoryModal
        visible={createModalVisible}
        userId={userId}
        onClose={() => setCreateModalVisible(false)}
        onCreated={() => {}}
      />
      <EditCategoryModal
        visible={editModalVisible}
        userId={userId}
        category={selectedCategory}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedCategory(null);
        }}
        onUpdated={() => {}}
      />
    </>
  );
};

export default AppServicesCategories;
