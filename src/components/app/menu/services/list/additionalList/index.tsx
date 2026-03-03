import React, { useCallback, useMemo } from "react";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { skipToken } from "@reduxjs/toolkit/query";

import {
  useGetAdditionalServicesInfiniteQuery,
  useReorderAdditionalServicesMutation,
  useUpdateAdditionalServiceMutation,
} from "@/src/store/redux/services/api/servicesApi";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import AdditionalServiceItem, {
  AdditionalListItem,
} from "@/src/components/app/menu/services/list/additionalList/additionalServiceItem";
import {
  AdditionalListErrorState,
  AdditionalListFooter,
  AdditionalListLoadingState,
} from "@/src/components/app/menu/services/list/additionalList/listStates";

const AdditionalList = () => {
  const isEditMode = useAppSelector((s) => s.services.isEditMode);
  const auth = useRequiredAuth();

  const [updateAdditionalService] = useUpdateAdditionalServiceMutation();
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

    const unique = new Map<number, any>();

    data.pages.forEach((page) => {
      page.additional_services.forEach((service) => {
        unique.set(service.id, service);
      });
    });

    return [...unique.values()];
  }, [data?.pages]);

  const handleToggleActive = (id: number, nextValue: boolean) => {
    if (!auth?.userId) return;

    updateAdditionalService({
      userId: auth.userId,
      id,
      data: { is_active: nextValue },
    });
  };

  const handleDragEnd = async ({
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
    <DraggableFlatList
      data={services}
      scrollEnabled={false}
      keyExtractor={(item) => String(item.id)}
      activationDistance={10}
      autoscrollThreshold={48}
      autoscrollSpeed={220}
      onDragEnd={handleDragEnd}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.35}
      contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 8,
      }}
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
        />
      )}
      ListFooterComponent={
        <AdditionalListFooter isFetchingNextPage={isFetchingNextPage} />
      }
    />
  );
};

export default AdditionalList;
