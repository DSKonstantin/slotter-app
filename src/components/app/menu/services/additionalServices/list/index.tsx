import React, { useCallback, memo, useMemo } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";

import { Button, Card, StSvg, Typography, Switch } from "@/src/components/ui";

import { colors } from "@/src/styles/colors";

import {
  useGetAdditionalServicesInfiniteQuery,
  useReorderAdditionalServicesMutation,
  useUpdateAdditionalServiceMutation,
} from "@/src/store/redux/services/api/servicesApi";
import type { AdditionalService } from "@/src/store/redux/services/api-types";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useInfiniteListConfig } from "@/src/hooks/useInfiniteListConfig";
import { Routers } from "@/src/constants/routers";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

const AdditionalServicesList = () => {
  const [updateAdditionalService] = useUpdateAdditionalServiceMutation();
  const [reorderAdditionalServices] = useReorderAdditionalServicesMutation();
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
  } = useGetAdditionalServicesInfiniteQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const services = useMemo(() => {
    if (!data?.pages) return [];

    const unique = new Map<number, AdditionalService>();

    data.pages.forEach((page) => {
      page.additional_services.forEach((service) => {
        unique.set(service.id, service);
      });
    });

    return [...unique.values()];
  }, [data?.pages]);

  const handleToggleServiceActive = useCallback(
    (serviceId: number, nextValue: boolean) => {
      if (auth?.userId == null) return;

      updateAdditionalService({
        userId: auth.userId,
        id: serviceId,
        data: { is_active: nextValue },
      })
        .unwrap()
        .catch((error: any) => {
          toast.error(getApiErrorMessage(error, "Не удалось обновить услугу"));
        });
    },
    [auth?.userId, updateAdditionalService],
  );

  const handleDragEnd = useCallback(
    async ({
      data: nextData,
      from,
      to,
    }: {
      data: AdditionalService[];
      from: number;
      to: number;
    }) => {
      if (from === to || auth?.userId == null) return;

      try {
        await reorderAdditionalServices({
          userId: auth.userId,
          positions: nextData.map((service, index) => ({
            id: service.id,
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

  if (!auth) {
    return null;
  }

  return (
    <ScreenWithToolbar title="Доп. услуги">
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
                Ошибка загрузки услуг.
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
              data={services}
              contentContainerStyle={{
                ...listConfig.contentContainerStyle,
                paddingTop: topInset,
                paddingBottom: bottomInset + 16,
              }}
              ListHeaderComponent={
                <Typography className="text-caption text-neutral-500 mb-2">
                  Существующие услуги
                </Typography>
              }
              keyExtractor={(item) => String(item.id)}
              activationDistance={listConfig.activationDistance}
              autoscrollThreshold={listConfig.autoscrollThreshold}
              autoscrollSpeed={listConfig.autoscrollSpeed}
              onDragEnd={handleDragEnd}
              onEndReached={handleEndReached}
              onEndReachedThreshold={listConfig.onEndReachedThreshold}
              renderItem={({
                item,
                drag,
                isActive,
              }: RenderItemParams<AdditionalService>) => (
                <Card
                  title={item.name}
                  pressArea="content"
                  active={isActive}
                  className={item.is_active ? "" : "opacity-40"}
                  subtitle={`${item.duration} мин | ${formatRublesFromCents(item.price_cents)}`}
                  left={
                    <Pressable
                      onLongPress={drag}
                      delayLongPress={100}
                      hitSlop={8}
                      accessibilityLabel="Reorder service"
                      accessibilityRole="button"
                    >
                      <StSvg
                        name="Drag"
                        size={24}
                        color={colors.neutral[900]}
                      />
                    </Pressable>
                  }
                  right={
                    <Switch
                      value={item.is_active}
                      onChange={(nextValue) =>
                        handleToggleServiceActive(item.id, nextValue)
                      }
                    />
                  }
                  onPress={() => {
                    handleServicePress(item.id);
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
                    title="Создать новую услугу"
                    variant="clear"
                    onPress={() =>
                      router.push(
                        Routers.app.menu.services.additionalServices.create,
                      )
                    }
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
  );
};

export default memo(AdditionalServicesList);
