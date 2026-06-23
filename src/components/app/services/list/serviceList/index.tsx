import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { Alert, LayoutAnimation, Pressable, Text, View } from "react-native";
import { toast } from "@backpackapp-io/react-native-toast";
import {
  NestableDraggableFlatList,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import {
  Button,
  Card,
  Divider,
  IconButton,
  StSvg,
  Tag,
  Typography,
} from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useReorderServiceCategoriesMutation } from "@/src/store/redux/services/api/serviceCategoriesApi";
import {
  useDeleteServiceMutation,
  useReorderServicesMutation,
  useUpdateServiceMutation,
} from "@/src/store/redux/services/api/servicesApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import { Service, ServiceCategory } from "@/src/store/redux/services/api-types";
import ServiceCategoryHeader from "@/src/components/app/services/shared/serviceCategoryHeader";
import { ServiceListSkeleton } from "@/src/components/app/services/list/listSkeletons";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { formatDuration } from "@/src/utils/date/formatTime";

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
  const [reorderKey, setReorderKey] = useState(0);
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(
    () => new Set(),
  );
  const autoCollapsedCategoryRef = useRef<number | null>(null);

  const isEditMode = useAppSelector((s) => s.services.isEditMode);

  const [reorderServiceCategories] = useReorderServiceCategoriesMutation();
  const [reorderServices] = useReorderServicesMutation();
  const [updateService] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    for (const category of categories) {
      items.push({ _id: `cat-${category.id}`, type: "category", category });
      if (!collapsedIds.has(category.id)) {
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
  }, [categories, collapsedIds]);

  const handleToggleExpanded = useCallback((categoryId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

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
        const positions = data
          .filter((item): item is FlatCategoryItem => item.type === "category")
          .map((item, index) => ({ id: item.category.id, position: index }));
        try {
          await reorderServiceCategories({
            userId: auth.userId,
            positions,
          }).unwrap();
        } catch (error) {
          toast.error(
            getApiErrorMessage(error, "Не удалось изменить порядок категорий"),
          );
        }
        return;
      }

      const { service, categoryId: sourceCategoryId } = movedItem;

      // Nearest category header at or above the drop position
      const catIndex = data
        .slice(0, to + 1)
        .findLastIndex((item) => item.type === "category");
      if (catIndex === -1) {
        setReorderKey((k) => k + 1);
        return;
      }
      const targetCategoryId = (data[catIndex] as FlatCategoryItem).category.id;

      // Services between this category header and the next one (or end of list)
      const nextCatOffset = data
        .slice(catIndex + 1)
        .findIndex((item) => item.type === "category");
      const slotEnd =
        nextCatOffset === -1 ? data.length : catIndex + 1 + nextCatOffset;
      const positions = data
        .slice(catIndex + 1, slotEnd)
        .filter((item): item is FlatServiceItem => item.type === "service")
        .map((item, index) => ({ id: item.service.id, position: index }));

      if (sourceCategoryId === targetCategoryId) {
        try {
          await reorderServices({
            categoryId: targetCategoryId,
            positions,
          }).unwrap();
        } catch (error) {
          toast.error(
            getApiErrorMessage(error, "Не удалось изменить порядок услуг"),
          );
        }
        return;
      }

      // Cross-category move
      try {
        await updateService({
          categoryId: sourceCategoryId,
          id: service.id,
          data: { service_category_id: targetCategoryId },
        }).unwrap();
        await reorderServices({
          categoryId: targetCategoryId,
          positions,
        }).unwrap();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось перенести услугу"));
      }
    },
    [auth, reorderServiceCategories, reorderServices, updateService],
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
        const isExpanded = !collapsedIds.has(category.id);
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
              onDrag={() => {
                if (isExpanded) {
                  autoCollapsedCategoryRef.current = category.id;
                  setCollapsedIds((prev) => {
                    const next = new Set(prev);
                    next.add(category.id);
                    return next;
                  });
                  requestAnimationFrame(() => drag());
                  return;
                }
                drag();
              }}
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
            subtitle={`${formatDuration(service.duration)} | ${formatRublesFromCents(service.price_cents)}`}
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
            onLongPress={drag}
          />
        );
      }

      return (
        <Card
          title={service.name}
          titleProps={{ numberOfLines: 1, ellipsizeMode: "tail" }}
          subtitle={`${formatDuration(service.duration)} | ${formatRublesFromCents(service.price_cents)}`}
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
      collapsedIds,
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
      extraData={reorderKey}
      showsVerticalScrollIndicator={false}
      onDragEnd={(params) => {
        const restoreId = autoCollapsedCategoryRef.current;
        if (restoreId !== null) {
          autoCollapsedCategoryRef.current = null;
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setCollapsedIds((prev) => {
            const next = new Set(prev);
            next.delete(restoreId);
            return next;
          });
        }
        void handleDragEnd(params);
      }}
      accessibilityRole="list"
      ListEmptyComponent={
        <View className="pt-6 gap-3">
          <Typography className="text-neutral-500">
            Категорий пока нет.
          </Typography>
          <Button
            title="Создать категорию"
            variant="secondary"
            onPress={() => router.push(Routers.app.services.categories)}
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
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListFooterComponent={
        categories.length > 0 ? (
          <View className="gap-6 pt-6">
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
