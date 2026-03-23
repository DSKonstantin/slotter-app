import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { Button, PaginationDots, Typography } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";
import type {
  Service,
  ServiceCategory,
} from "@/src/store/redux/services/api-types";
import { colors } from "@/src/styles/colors";
import PreviewServiceCard from "@/src/components/app/menu/account/preview/services/PreviewServiceCard";

type PreviewServiceCategory = ServiceCategory & {
  services: Service[];
};

const Services = () => {
  const auth = useRequiredAuth();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Service>>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useGetServiceCategoriesInfiniteQuery(
    auth
      ? {
          userId: auth.userId,
          params: { view: "public_profile", per_page: 100 },
        }
      : skipToken,
  );

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isError) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isError, isFetchingNextPage]);

  const categories = useMemo<PreviewServiceCategory[]>(() => {
    return (data?.pages.flatMap((page) => page.service_categories) ?? [])
      .filter((category) => category.is_active)
      .map((category) => ({
        ...category,
        services: (category.services ?? []).filter(
          (service) => service.is_active,
        ),
      }))
      .filter((category) => category.services.length > 0);
  }, [data]);

  const totalServicesCount = useMemo(
    () =>
      categories.reduce(
        (sum, category) => sum + (category.services?.length ?? 0),
        0,
      ),
    [categories],
  );

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategoryId(null);
      return;
    }

    setSelectedCategoryId((prev) =>
      categories.some((category) => category.id === prev)
        ? prev
        : categories[0].id,
    );
  }, [categories]);

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId) ??
      categories[0] ??
      null,
    [categories, selectedCategoryId],
  );

  const cardWidth = useMemo(() => Math.min(width - 76, 340), [width]);
  const snapInterval = useMemo(() => cardWidth + 12, [cardWidth]);
  const listTrailingPadding = useMemo(
    () => Math.max(width - 40 - cardWidth, 0),
    [cardWidth, width],
  );

  useEffect(() => {
    setActiveSlideIndex(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedCategory?.id]);

  const handleRetry = useCallback(() => {
    refetch({ refetchCachedPages: false });
  }, [refetch]);

  const handleCategoryPress = useCallback((categoryId: number) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / snapInterval,
      );
      setActiveSlideIndex(nextIndex);
    },
    [snapInterval],
  );

  const handleDotSelect = useCallback(
    (index: number) => {
      setActiveSlideIndex(index);
      listRef.current?.scrollToOffset({
        offset: index * snapInterval,
        animated: true,
      });
    },
    [snapInterval],
  );

  if (!auth) return null;

  if (isLoading && !data) {
    return (
      <View className="gap-3 rounded-[28px] bg-background-surface p-5">
        <Typography weight="semibold" className="text-[20px] text-neutral-900">
          Услуги
        </Typography>
        <View className="h-[240px] items-center justify-center rounded-[24px] bg-background">
          <ActivityIndicator color={colors.neutral[400]} />
        </View>
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View className="gap-3 rounded-[28px] bg-background-surface p-5">
        <Typography weight="semibold" className="text-[20px] text-neutral-900">
          Услуги
        </Typography>
        <View className="gap-3 rounded-[24px] bg-background p-4">
          <Typography className="text-body text-neutral-500">
            Не удалось загрузить список услуг.
          </Typography>
          <Button
            title="Повторить"
            variant="secondary"
            onPress={handleRetry}
            loading={isFetching}
          />
        </View>
      </View>
    );
  }

  if (!selectedCategory) return null;

  return (
    <View className="gap-4">
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1 gap-1">
          <Typography
            weight="semibold"
            className="text-[20px] text-neutral-900"
          >
            Услуги
          </Typography>
          <Typography className="text-body text-neutral-500">
            {totalServicesCount} {totalServicesCount === 1 ? "услуга" : "услуг"}
          </Typography>
        </View>

        {isFetchingNextPage ? (
          <ActivityIndicator color={colors.neutral[400]} />
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pr-5">
          {categories.map((category) => {
            const isActive = category.id === selectedCategory.id;

            return (
              <Pressable
                key={category.id}
                onPress={() => handleCategoryPress(category.id)}
                className={`rounded-full px-4 py-3 ${
                  isActive ? "bg-background-black" : "bg-background-surface"
                }`}
              >
                <Typography
                  weight="semibold"
                  className={`text-caption uppercase ${
                    isActive ? "text-neutral-0" : "text-neutral-500"
                  }`}
                >
                  {category.name}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <FlatList
        ref={listRef}
        data={selectedCategory.services}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(service) => String(service.id)}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{ paddingRight: listTrailingPadding }}
        ItemSeparatorComponent={() => <View className="w-3" />}
        renderItem={({ item }) => (
          <PreviewServiceCard
            service={item}
            categoryName={selectedCategory.name}
            width={cardWidth}
          />
        )}
      />

      {selectedCategory.services.length > 1 ? (
        <View className="items-center">
          <PaginationDots
            count={selectedCategory.services.length}
            activeIndex={activeSlideIndex}
            onSelect={handleDotSelect}
          />
        </View>
      ) : null}
    </View>
  );
};

export default Services;
