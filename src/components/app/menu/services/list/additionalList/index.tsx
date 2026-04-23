import React, { useCallback, useMemo, memo } from "react";
import { Alert, View } from "react-native";
import {
  NestableDraggableFlatList,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

import {
  useDeleteAdditionalServiceMutation,
  useReorderAdditionalServicesMutation,
  useToggleAdditionalServiceActiveMutation,
} from "@/src/store/redux/services/api/additionalServicesApi";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import { Button, Typography } from "@/src/components/ui";
import AdditionalServiceItem, {
  AdditionalListItem,
} from "@/src/components/app/menu/services/list/additionalList/additionalServiceItem";
import { AdditionalListErrorState } from "@/src/components/app/menu/services/list/additionalList/listStates";
import AdditionalServicesHeader from "@/src/components/app/menu/services/shared/additionalServicesHeader";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { AdditionalListSkeleton } from "@/src/components/app/menu/services/list/listSkeletons";

type AdditionalListProps = {
  services: AdditionalListItem[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
};

const AdditionalList = ({
  services,
  isLoading,
  isError,
  isFetching,
  hasNextPage,
  isFetchingNextPage,
  onRefresh,
  onLoadMore,
}: AdditionalListProps) => {
  const isEditMode = useAppSelector((s) => s.services.isEditMode);
  const auth = useRequiredAuth();

  const [toggleActive] = useToggleAdditionalServiceActiveMutation();
  const [deleteAdditionalService] = useDeleteAdditionalServiceMutation();
  const [reorderAdditionalServices] = useReorderAdditionalServicesMutation();

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

  const handleServicePress = useCallback((serviceId: number) => {
    router.push(Routers.app.menu.services.additionalServices.edit(serviceId));
  }, []);

  if (!auth) return null;

  if (isLoading && !services.length) {
    return <AdditionalListSkeleton />;
  }

  if (isError && !services.length) {
    return (
      <AdditionalListErrorState isFetching={isFetching} onRetry={onRefresh} />
    );
  }

  return (
    <NestableDraggableFlatList
      data={services}
      keyExtractor={(item) => String(item.id)}
      onDragEnd={handleDragEnd}
      accessibilityRole="list"
      ListHeaderComponent={
        <View className="mb-2">
          <AdditionalServicesHeader
            activeCount={activeServicesCount}
            totalCount={services.length}
          />
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListFooterComponent={
        hasNextPage ? (
          <Button
            title="Показать ещё"
            onPress={onLoadMore}
            loading={isFetchingNextPage}
            disabled={isFetchingNextPage}
            buttonClassName="mt-2"
          />
        ) : undefined
      }
      ListEmptyComponent={
        <View className="py-6">
          <Typography className="text-neutral-500">
            Дополнительные услуги пока отсутствуют.
          </Typography>
        </View>
      }
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
    />
  );
};

export default memo(AdditionalList);
