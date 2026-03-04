import React, { useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import { toast } from "@backpackapp-io/react-native-toast";
import {
  NestableDraggableFlatList,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Button, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import {
  useGetServiceCategoriesInfiniteQuery,
  useReorderServiceCategoriesMutation,
  useReorderServicesMutation,
} from "@/src/store/redux/services/api/servicesApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useInfiniteListConfig } from "@/src/hooks/useInfiniteListConfig";
import { useAppSelector } from "@/src/store/redux/store";
import { Service, ServiceCategory } from "@/src/store/redux/services/api-types";
import ServiceCategoryItem from "@/src/components/app/menu/services/list/serviceList/serviceCategoryItem";
import { ServiceListSkeleton } from "@/src/components/app/menu/services/list/listSkeletons";

const ServiceList = () => {
  const auth = useRequiredAuth();
  const isEditMode = useAppSelector((s) => s.services.isEditMode);
  const [reorderServiceCategories] = useReorderServiceCategoriesMutation();
  const [reorderServices] = useReorderServicesMutation();
  const listConfig = useInfiniteListConfig();

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
      } catch (error: any) {
        toast.error(error?.data?.error || "Failed to reorder categories");
      }
    },
    [auth?.userId, reorderServiceCategories],
  );

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    if (isFetchingNextPage) return;

    refetch({ refetchCachedPages: false });
  }, [isFetchingNextPage, refetch]);

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
      } catch (error: any) {
        toast.error(error?.data?.error || "Failed to reorder services");
      }
    },
    [auth?.userId, reorderServices],
  );

  if (isLoading && !data) {
    return <ServiceListSkeleton />;
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
    <NestableDraggableFlatList
      data={categories}
      scrollEnabled={false}
      keyExtractor={(item) => String(item.id)}
      showsVerticalScrollIndicator={false}
      onRefresh={handleRefresh}
      refreshing={isFetching && !isFetchingNextPage && !isLoading}
      onEndReached={handleEndReached}
      onDragEnd={isEditMode ? handleDragEnd : undefined}
      contentContainerStyle={{
        paddingHorizontal: listConfig.contentContainerStyle.paddingHorizontal,
      }}
      accessibilityRole="list"
      ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
      ListEmptyComponent={
        <View className="pt-6">
          <Typography className="text-neutral-500">
            Категорий пока нет.
          </Typography>
        </View>
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

export default React.memo(ServiceList);
