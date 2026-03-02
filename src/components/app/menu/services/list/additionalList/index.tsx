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
  useGetAdditionalServicesInfiniteQuery,
  useReorderAdditionalServicesMutation,
  useUpdateAdditionalServiceMutation,
} from "@/src/store/redux/services/api/servicesApi";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";

const AdditionalList = () => {
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

  const services = useMemo(() => {
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
    data: any[];
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
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View className="flex-1 items-center justify-center px-screen gap-4">
        <Typography className="text-body text-accent-red-500">
          Ошибка загрузки.
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

  if (!auth) return null;

  return (
    <View>
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
          // paddingTop: topInset,
          // paddingBottom: bottomInset + 16,
          paddingHorizontal: 20,
          gap: 8,
        }}
        renderItem={({ item, drag, isActive }: RenderItemParams<any>) => (
          <Card
            title={item.name}
            subtitle={`${item.duration} мин | ${(
              item.price_cents / 100
            ).toLocaleString("ru-RU")} ₽`}
            active={isActive}
            className={item.is_active ? "" : "opacity-40"}
            left={
              <Pressable onLongPress={drag} delayLongPress={100} hitSlop={8}>
                <StSvg name="Drag" size={24} color={colors.neutral[900]} />
              </Pressable>
            }
            right={
              <Switch
                value={item.is_active}
                onChange={(next) => handleToggleActive(item.id, next)}
              />
            }
            onPress={() => {
              // setSelectedService(item);
              // setEditVisible(true);
            }}
          />
        )}
        ListFooterComponent={
          <View className="gap-2">
            {isFetchingNextPage && (
              <View className="items-center py-2">
                <ActivityIndicator />
              </View>
            )}
          </View>
        }
      />
    </View>
  );
};

export default AdditionalList;
