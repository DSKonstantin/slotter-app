import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { useSelector } from "react-redux";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

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
  useGetServiceCategoriesQuery,
  useUpdateServiceCategoryMutation,
} from "@/src/store/redux/services/api/servicesApi";
import type { ServiceCategory } from "@/src/store/redux/services/api-types";

import { RootState } from "@/src/store/redux/store";
import CreateCategoryModal from "@/src/components/app/menu/services/createCategoryModal";
import EditCategoryModal from "@/src/components/app/menu/services/editCategoryModal";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

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
  const [localCategories, setLocalCategories] = useState<ServiceCategory[]>([]);
  const [updatingCategoryIds, setUpdatingCategoryIds] = useState<number[]>([]);
  const [updateServiceCategory] = useUpdateServiceCategoryMutation();

  const user = useSelector((state: RootState) => state.auth.user);

  const userId = user?.id;
  const { data, isLoading, refetch } = useGetServiceCategoriesQuery(
    { userId: userId!, params: { view: "with_services" } },
    {
      skip: !userId,
    },
  );

  const handleToggleCategoryActive = (
    categoryId: number,
    currentValue: boolean,
    nextValue: boolean,
  ) => {
    if (!userId) return;

    setLocalCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, is_active: nextValue }
          : category,
      ),
    );

    setUpdatingCategoryIds((prev) => [...prev, categoryId]);

    void updateServiceCategory({
      userId,
      id: categoryId,
      data: { is_active: nextValue },
    })
      .unwrap()
      .catch(() => {
        setLocalCategories((prev) =>
          prev.map((category) =>
            category.id === categoryId
              ? { ...category, is_active: currentValue }
              : category,
          ),
        );
      })
      .finally(() => {
        setUpdatingCategoryIds((prev) =>
          prev.filter((id) => id !== categoryId),
        );
      });
  };

  const handleDragEnd = ({ data: nextData }: { data: ServiceCategory[] }) => {
    const changedCategories = nextData
      .map((item, index) => ({
        ...item,
        position: index,
        hasPositionChanged: item.position !== index,
      }))
      .filter((item) => item.hasPositionChanged);

    const nextDataWithPosition = nextData.map((item, index) => ({
      ...item,
      position: index,
    }));

    setLocalCategories(nextDataWithPosition);

    if (!userId) return;
    if (!changedCategories.length) return;

    void Promise.allSettled(
      changedCategories.map((category) =>
        updateServiceCategory({
          userId,
          id: category.id,
          data: { position: category.position },
        }).unwrap(),
      ),
    ).then(() => {
      // refetch();
    });
  };

  useEffect(() => {
    const categories = data?.service_categories ?? [];
    setLocalCategories(
      [...categories].sort((first, second) => first.position - second.position),
    );
  }, [data?.service_categories]);

  if (isLoading && !data) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
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
        {({ topInset }) => (
          <View className="flex-1 px-screen">
            <DraggableFlatList
              data={localCategories}
              containerStyle={{
                paddingTop: topInset,
                flex: 1,
              }}
              ListHeaderComponent={
                <Typography className="text-caption text-neutral-500 mb-2">
                  Существующие категории
                </Typography>
              }
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ gap: 8 }}
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
                      disabled={updatingCategoryIds.includes(item.id)}
                      onChange={(nextValue) =>
                        handleToggleCategoryActive(
                          item.id,
                          item.is_active,
                          nextValue,
                        )
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
        userId={userId!}
        onClose={() => setCreateModalVisible(false)}
        onCreated={() => {}}
      />
      <EditCategoryModal
        visible={editModalVisible}
        userId={userId!}
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
