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
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SelectedCategory = {
  id: number;
  name: string;
  color?: string | null;
};

const AppServicesCategories = () => {
  const { bottom } = useSafeAreaInsets();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<SelectedCategory | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [updateServiceCategory] = useUpdateServiceCategoryMutation();

  const user = useSelector((state: RootState) => state.auth.user);

  const userId = user?.id;
  const { data, isLoading } = useGetServiceCategoriesQuery(
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

    updateServiceCategory({
      userId,
      id: categoryId,
      data: { is_active: nextValue },
    }).unwrap();
  };

  const updateCategoriesOrder = async (
    movedItem: ServiceCategory,
    newPosition: number,
  ) => {
    if (!userId) return;

    await updateServiceCategory({
      userId,
      id: movedItem.id,
      data: {
        position: newPosition,
      },
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
    if (from === to) return;
    setCategories(nextData);
    const prevData = categories;

    const movedItem = nextData[to];

    try {
      await updateCategoriesOrder(movedItem, to);
    } catch (e) {
      // rollback
      setCategories(prevData);
    }

    // если нужно отправить порядок на сервер:
    // updateCategoriesOrder(nextData)
  };

  useEffect(() => {
    if (data?.service_categories) {
      const sorted = [...data.service_categories].sort(
        (a, b) => a.position - b.position,
      );

      setCategories(sorted);
    }
  }, [data]);

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
          <View className="flex-1">
            <DraggableFlatList
              data={categories}
              contentContainerStyle={{
                paddingTop: topInset,
                paddingBottom: TAB_BAR_HEIGHT + bottom + 16,
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
