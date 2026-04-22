import React, { useCallback, useMemo } from "react";
import { Alert, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

import {
  useDeleteAdditionalServiceMutation,
  useGetAdditionalServicesInfiniteQuery,
  useReorderAdditionalServicesMutation,
  useToggleAdditionalServiceActiveMutation,
} from "@/src/store/redux/services/api/servicesApi";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useInfiniteListConfig } from "@/src/hooks/useInfiniteListConfig";
import { useAppSelector } from "@/src/store/redux/store";
import { Typography } from "@/src/components/ui";
import AdditionalServiceItem, {
  AdditionalListItem,
} from "@/src/components/app/menu/services/list/additionalList/additionalServiceItem";
import {
  AdditionalListErrorState,
  AdditionalListFooter,
  AdditionalListLoadingState,
} from "@/src/components/app/menu/services/list/additionalList/listStates";
import AdditionalServicesHeader from "@/src/components/app/menu/services/shared/additionalServicesHeader";
import { getApiErrorMessage } from "@/src/utils/apiError";

const AdditionalList = () => {
  const isEditMode = useAppSelector((s) => s.services.isEditMode);
  const auth = useRequiredAuth();
  const listConfig = useInfiniteListConfig();

  const [toggleActive] = useToggleAdditionalServiceActiveMutation();
  const [deleteAdditionalService] = useDeleteAdditionalServiceMutation();
  const [reorderAdditionalServices] = useReorderAdditionalServicesMutation();

  const {
    data,
    refetch,
    isLoading,
    isFetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAdditionalServicesInfiniteQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const services = useMemo<AdditionalListItem[]>(() => {
    if (!data?.pages) return [];

    const unique = new Map<number, AdditionalListItem>();

    data.pages.forEach((page) => {
      page.additional_services.forEach((service) => {
        unique.set(service.id, service);
      });
    });

    return [...unique.values()];
  }, [data?.pages]);

  const activeServicesCount = useMemo(
    () => services.filter((service) => service.is_active).length,
    [services],
  );

  const handleToggleActive = useCallback(
    (id: number, nextValue: boolean) => {
      if (!auth?.userId) return;

      toggleActive({
        userId: auth.userId,
        id,
        is_active: nextValue,
      })
        .unwrap()
        .catch((error: any) => {
          toast.error(getApiErrorMessage(error, "Не удалось обновить услугу"));
        });
    },
    [auth?.userId, toggleActive],
  );

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert("Удалить услугу?", "Это действие нельзя отменить", [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            if (!auth?.userId) return;

            try {
              await deleteAdditionalService({
                userId: auth.userId,
                id,
              }).unwrap();
            } catch (error) {
              toast.error(
                getApiErrorMessage(error, "Не удалось удалить услугу"),
              );
            }
          },
        },
      ]);
    },
    [auth?.userId, deleteAdditionalService],
  );

  const handleDragEnd = useCallback(
    async ({
      data: nextData,
      from,
      to,
    }: {
      data: AdditionalListItem[];
      from: number;
      to: number;
    }) => {
      if (from === to || !auth?.userId) return;

      try {
        await reorderAdditionalServices({
          userId: auth.userId,
          positions: nextData.map((item, index) => ({
            id: item.id,
            position: index,
          })),
        }).unwrap();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Не удалось изменить порядок услуг"),
        );
      }
    },
    [auth?.userId, reorderAdditionalServices],
  );

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    if (isFetchingNextPage) return;
    refetch({ refetchCachedPages: false });
  }, [isFetchingNextPage, refetch]);

  const handleServicePress = useCallback((serviceId: number) => {
    router.push(Routers.app.menu.services.additionalServices.edit(serviceId));
  }, []);

  if (isLoading && !data) {
    return <AdditionalListLoadingState />;
  }

  if (isError && !data) {
    return (
      <AdditionalListErrorState
        isFetching={isFetching}
        onRetry={handleRefresh}
      />
    );
  }

  if (!auth) return null;

  return (
    <View className="px-screen">
      <View className="px-0 mb-2">
        <AdditionalServicesHeader
          activeCount={activeServicesCount}
          totalCount={services.length}
        />
      </View>

      <DraggableFlatList
        data={services}
        scrollEnabled={false}
        keyExtractor={(item) => String(item.id)}
        activationDistance={listConfig.activationDistance}
        autoscrollThreshold={listConfig.autoscrollThreshold}
        autoscrollSpeed={listConfig.autoscrollSpeed}
        onDragEnd={handleDragEnd}
        onEndReached={handleEndReached}
        onEndReachedThreshold={listConfig.onEndReachedThreshold}
        contentContainerStyle={{
          gap: listConfig.contentContainerStyle.gap,
        }}
        accessibilityRole="list"
        renderItem={({
          item,
          drag,
          isActive,
        }: RenderItemParams<AdditionalListItem>) => (
          <AdditionalServiceItem
            item={item}
            isEditMode={isEditMode}
            isDragActive={isActive}
            onDrag={drag}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
            onPress={handleServicePress}
          />
        )}
        ListEmptyComponent={
          <View className="py-6">
            <Typography className="text-neutral-500 text-center">
              Дополнительные услуги пока отсутствуют.
            </Typography>
          </View>
        }
        ListFooterComponent={
          <AdditionalListFooter isFetchingNextPage={isFetchingNextPage} />
        }
      />
    </View>
  );
};

export default React.memo(AdditionalList);
