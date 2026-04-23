import React, { memo, useCallback } from "react";
import { Text, View } from "react-native";
import { toast } from "@backpackapp-io/react-native-toast";
import {
  NestableDraggableFlatList,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Button, Divider, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useReorderServiceCategoriesMutation } from "@/src/store/redux/services/api/serviceCategoriesApi";
import { useReorderServicesMutation } from "@/src/store/redux/services/api/servicesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import { Service, ServiceCategory } from "@/src/store/redux/services/api-types";
import ServiceCategoryItem from "@/src/components/app/menu/services/list/serviceList/serviceCategoryItem";
import { ServiceListSkeleton } from "@/src/components/app/menu/services/list/listSkeletons";
import { getApiErrorMessage } from "@/src/utils/apiError";

type ServiceListProps = {
  categories: ServiceCategory[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
};

const ServiceList = ({
  categories,
  isLoading,
  isError,
  isFetching,
  hasNextPage,
  isFetchingNextPage,
  onRefresh,
  onLoadMore,
}: ServiceListProps) => {
  const auth = useRequiredAuth();
  const isEditMode = useAppSelector((s) => s.services.isEditMode);
  const [reorderServiceCategories] = useReorderServiceCategoriesMutation();
  const [reorderServices] = useReorderServicesMutation();

  const handleDragEnd = useCallback(
    async ({
      data: nextData,
      from,
      to,
    }: {
      data: typeof categories;
      from: number;
      to: number;
    }) => {
      if (from === to || !auth?.userId) return;

      try {
        await reorderServiceCategories({
          userId: auth.userId,
          positions: nextData.map((item, index) => ({
            id: item.id,
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

  const handleServicePress = useCallback(
    (serviceId: number, categoryId: number) => {
      router.push(Routers.app.menu.services.edit(serviceId, categoryId));
    },
    [],
  );

  const handleCreateServicePress = useCallback((categoryId: number) => {
    router.push(Routers.app.menu.services.create(categoryId));
  }, []);

  const handleServicesReorder = useCallback(
    async (
      categoryId: number,
      nextServices: Service[],
      from: number,
      to: number,
    ) => {
      if (from === to) return;
      if (!auth?.userId) return;

      try {
        await reorderServices({
          categoryId,
          positions: nextServices.map((service, index) => ({
            id: service.id,
            position: index,
          })),
        }).unwrap();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to reorder services"));
      }
    },
    [auth?.userId, reorderServices],
  );

  if (isLoading && !categories.length) {
    return <ServiceListSkeleton />;
  }

  if (isError && !categories.length) {
    return (
      <View className="flex-1 items-center justify-center px-screen gap-4">
        <Text className="text-body text-accent-red-500">
          Ошибка загрузки категорий.
        </Text>
        <Button
          title="Повторить"
          onPress={onRefresh}
          loading={isFetching}
          disabled={isFetching}
          buttonClassName="w-full"
        />
      </View>
    );
  }

  return (
    <NestableDraggableFlatList
      data={categories}
      keyExtractor={(item) => String(item.id)}
      showsVerticalScrollIndicator={false}
      onDragEnd={handleDragEnd}
      accessibilityRole="list"
      ListEmptyComponent={
        <View className="pt-6">
          <Typography className="text-neutral-500">
            Категорий пока нет.
          </Typography>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
      ListFooterComponent={
        categories.length > 0 ? (
          <View style={{ gap: 24, paddingTop: 24 }}>
            {hasNextPage && (
              <Button
                title="Загрузить ещё"
                onPress={onLoadMore}
                loading={isFetchingNextPage}
                disabled={isFetchingNextPage}
              />
            )}
            <Divider />
          </View>
        ) : undefined
      }
      renderItem={({
        item: category,
        drag,
        isActive,
      }: RenderItemParams<ServiceCategory>) => (
        <ServiceCategoryItem
          category={category}
          isEditMode={isEditMode}
          onDrag={drag}
          isDragActive={isActive}
          onServicePress={handleServicePress}
          onCreateServicePress={handleCreateServicePress}
          onServicesReorder={handleServicesReorder}
        />
      )}
    />
  );
};

export default memo(ServiceList);
