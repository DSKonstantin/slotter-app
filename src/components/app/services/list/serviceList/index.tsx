import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, LayoutAnimation, Pressable, Text, View } from "react-native";
import { toast } from "@backpackapp-io/react-native-toast";
import {
  NestableDraggableFlatList,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Button, Card, Divider, IconButton, StSvg, Tag, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import {
  useReorderServiceCategoriesMutation,
} from "@/src/store/redux/services/api/serviceCategoriesApi";
import {
  useDeleteServiceMutation,
  useReorderServicesMutation,
} from "@/src/store/redux/services/api/servicesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import { Service, ServiceCategory } from "@/src/store/redux/services/api-types";
import ServiceCategoryHeader from "@/src/components/app/services/shared/serviceCategoryHeader";
import { ServiceListSkeleton } from "@/src/components/app/services/list/listSkeletons";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";

type FlatCategoryItem = {
  _id: string;
  type: "category";
  category: ServiceCategory;
};

type FlatServiceItem = {
  _id: string;
  type: "service";
  service: Service;
  categoryId: number;
};

type FlatItem = FlatCategoryItem | FlatServiceItem;

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

  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(categories.map((c) => c.id)),
  );
  const seenIdsRef = useRef<Set<number>>(
    new Set(categories.map((c) => c.id)),
  );

  useEffect(() => {
    const newIds = categories
      .map((c) => c.id)
      .filter((id) => !seenIdsRef.current.has(id));
    if (newIds.length > 0) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.add(id));
        return next;
      });
      newIds.forEach((id) => seenIdsRef.current.add(id));
    }
  }, [categories]);

  const [reorderServiceCategories] = useReorderServiceCategoriesMutation();
  const [reorderServices] = useReorderServicesMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const handleToggleExpanded = useCallback((categoryId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    for (const category of categories) {
      items.push({ _id: `cat-${category.id}`, type: "category", category });
      if (expandedIds.has(category.id)) {
        for (const service of category.services ?? []) {
          items.push({
            _id: `svc-${service.id}`,
            type: "service",
            service,
            categoryId: category.id,
          });
        }
      }
    }
    return items;
  }, [categories, expandedIds]);

  const handleDragEnd = useCallback(
    async ({
      data,
      from,
      to,
    }: {
      data: FlatItem[];
      from: number;
      to: number;
    }) => {
      if (from === to || !auth?.userId) return;

      const movedItem = data[to];

      if (movedItem.type === "category") {
        const newOrder = data.filter(
          (item): item is FlatCategoryItem => item.type === "category",
        );
        try {
          await reorderServiceCategories({
            userId: auth.userId,
            positions: newOrder.map((item, index) => ({
              id: item.category.id,
              position: index,
            })),
          }).unwrap();
        } catch (error) {
          toast.error(
            getApiErrorMessage(error, "Не удалось изменить порядок категорий"),
          );
        }
        return;
      }

      const { categoryId } = movedItem;
      const above = to > 0 ? data[to - 1] : null;
      const below = to < data.length - 1 ? data[to + 1] : null;

      const aboveOk =
        !above ||
        (above.type === "category" && above.category.id === categoryId) ||
        (above.type === "service" && above.categoryId === categoryId);
      const belowOk =
        !below ||
        below.type === "category" ||
        (below.type === "service" && below.categoryId === categoryId);

      if (!aboveOk || !belowOk) return;

      const newServices = data
        .filter(
          (item): item is FlatServiceItem =>
            item.type === "service" && item.categoryId === categoryId,
        )
        .map((item) => item.service);

      try {
        await reorderServices({
          categoryId,
          positions: newServices.map((service, index) => ({
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
    [auth, reorderServiceCategories, reorderServices],
  );

  const handleServicePress = useCallback(
    (serviceId: number, categoryId: number) => {
      router.push(Routers.app.services.edit(serviceId, categoryId));
    },
    [],
  );

  const handleCreateServicePress = useCallback((categoryId: number) => {
    router.push(Routers.app.services.create(categoryId));
  }, []);

  const getDeleteHandler = useCallback(
    (serviceId: number, categoryId: number) => () => {
      if (isDeleting) return;
      Alert.alert("Удалить услугу?", "Это действие нельзя отменить", [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            void deleteService({ categoryId, id: serviceId })
              .unwrap()
              .catch((error) => {
                toast.error(
                  getApiErrorMessage(error, "Не удалось удалить услугу"),
                );
              });
          },
        },
      ]);
    },
    [deleteService, isDeleting],
  );

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<FlatItem>) => {
      if (item.type === "category") {
        const { category } = item;
        const isExpanded = expandedIds.has(category.id);
        const index = getIndex() ?? 0;

        return (
          <View style={{ gap: 8, marginTop: index > 0 ? 16 : 0 }}>
            <ServiceCategoryHeader
              name={category.name}
              activeCount={
                category.services?.filter((s) => s.is_active).length ?? 0
              }
              totalCount={category.services?.length ?? 0}
              isEditMode={isEditMode}
              isActive={category.is_active}
              onDrag={isExpanded ? undefined : drag}
              isDragActive={isActive}
              isExpanded={isExpanded}
              onPress={() => handleToggleExpanded(category.id)}
            />
            {isExpanded && !category.services?.length && (
              <Button
                title="Создать услугу"
                onPress={() => handleCreateServicePress(category.id)}
                variant="secondary"
                rightIcon={
                  <StSvg
                    name="Add_ring_fill_light"
                    size={18}
                    color={colors.neutral[900]}
                  />
                }
              />
            )}
          </View>
        );
      }

      const { service, categoryId } = item;

      if (isEditMode) {
        return (
          <Card
            title={service.name}
            titleProps={{ numberOfLines: 1, ellipsizeMode: "tail" }}
            subtitle={`${service.duration} мин | ${formatRublesFromCents(service.price_cents)}`}
            titleAccessory={
              !service.is_active ? <Tag title="скрыто" size="sm" /> : undefined
            }
            active={isActive}
            left={
              <Pressable
                onLongPress={drag}
                hitSlop={8}
                accessibilityLabel="Reorder service"
                accessibilityRole="button"
              >
                <StSvg name="Drag" size={24} color={colors.neutral[900]} />
              </Pressable>
            }
            right={
              <IconButton
                size="xs"
                disabled={isDeleting}
                onPress={getDeleteHandler(service.id, categoryId)}
                accessibilityLabel={`Delete ${service.name}`}
                icon={
                  <StSvg
                    name="Trash_light"
                    size={24}
                    color={colors.accent.red[500]}
                  />
                }
              />
            }
            pressArea="content"
            onPress={() => handleServicePress(service.id, categoryId)}
          />
        );
      }

      return (
        <Card
          title={service.name}
          titleProps={{ numberOfLines: 1, ellipsizeMode: "tail" }}
          subtitle={`${service.duration} мин | ${formatRublesFromCents(service.price_cents)}`}
          titleAccessory={
            !service.is_active ? <Tag title="скрыто" size="sm" /> : undefined
          }
          right={
            <StSvg
              name="Expand_right_light"
              size={24}
              color={colors.neutral[500]}
            />
          }
          pressArea="card"
          onPress={() => handleServicePress(service.id, categoryId)}
        />
      );
    },
    [
      expandedIds,
      isEditMode,
      isDeleting,
      handleToggleExpanded,
      handleCreateServicePress,
      handleServicePress,
      getDeleteHandler,
    ],
  );

  if (isLoading && !categories.length) {
    return <ServiceListSkeleton />;
  }

  if (isError && !categories.length) {
    return (
      <View className="flex-1 items-center justify-center px-screen gap-4">
        <Text className="text-body text-accent-red-500">
          Ошибка загрузки услуг.
        </Text>
        <Button
          title="Повторить"
          onPress={onRefresh}
          loading={isFetching}
          disabled={isFetching}
          rightIcon={
            <StSvg name="Refresh_2" size={24} color={colors.neutral[0]} />
          }
          buttonClassName="w-full"
        />
      </View>
    );
  }

  return (
    <NestableDraggableFlatList
      data={flatItems}
      keyExtractor={(item) => item._id}
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
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListFooterComponent={
        categories.length > 0 ? (
          <View style={{ gap: 24, paddingTop: 24 }}>
            {hasNextPage && (
              <Button
                title="Показать ещё"
                onPress={onLoadMore}
                loading={isFetchingNextPage}
                disabled={isFetchingNextPage}
              />
            )}
            <Divider />
          </View>
        ) : undefined
      }
      renderItem={renderItem}
    />
  );
};

export default memo(ServiceList);
