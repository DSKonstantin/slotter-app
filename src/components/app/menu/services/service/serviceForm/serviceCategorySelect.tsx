import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useController, useFormContext } from "react-hook-form";
import { skipToken } from "@reduxjs/toolkit/query";

import { Badge, Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";
import CreateCategoryModal from "@/src/components/app/menu/services/categories/createCategoryModal";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";

const ServiceCategorySelect = () => {
  const auth = useRequiredAuth();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const categoriesListRef =
    useRef<FlatList<{ id: number; name: string; position: number }>>(null);
  const scrollFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { control } = useFormContext();
  const {
    field: { value: selectedCategoryId, onChange: onCategoryChange },
    fieldState: { error },
  } = useController({
    control,
    name: "categoryId",
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetServiceCategoriesInfiniteQuery(
      auth
        ? { userId: auth.userId, params: { view: "with_services" } }
        : skipToken,
    );

  const categories = useMemo(() => {
    const unique = new Map<
      number,
      { id: number; name: string; position: number }
    >();

    data?.pages.forEach((page) => {
      page.service_categories.forEach((category) => {
        unique.set(category.id, {
          id: category.id,
          name: category.name,
          position: category.position,
        });
      });
    });

    return [...unique.values()];
  }, [data?.pages]);

  const normalizedSelectedCategoryId = useMemo(() => {
    const parsedCategoryId = Number(selectedCategoryId);
    return Number.isFinite(parsedCategoryId) && parsedCategoryId > 0
      ? parsedCategoryId
      : null;
  }, [selectedCategoryId]);

  const handleEndReached = useCallback(() => {
    if (!hasUserScrolled || !hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, hasUserScrolled, isFetchingNextPage]);

  useEffect(() => {
    if (normalizedSelectedCategoryId == null || categories.length === 0) return;

    const selectedCategoryIndex = categories.findIndex(
      (category) => category.id === normalizedSelectedCategoryId,
    );

    if (selectedCategoryIndex < 0) return;

    const timeoutId = setTimeout(() => {
      categoriesListRef.current?.scrollToIndex({
        index: selectedCategoryIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [categories, normalizedSelectedCategoryId]);

  useEffect(() => {
    return () => {
      if (scrollFallbackTimeoutRef.current) {
        clearTimeout(scrollFallbackTimeoutRef.current);
      }
    };
  }, []);

  if (!auth) {
    return null;
  }

  return (
    <>
      <Typography className="text-caption text-neutral-500 mb-2 px-screen">
        Категория
      </Typography>

      {isLoading && categories.length === 0 ? (
        <Typography className="text-caption text-neutral-500 mb-2 px-screen">
          Загрузка категорий...
        </Typography>
      ) : (
        <>
          <FlatList
            ref={categoriesListRef}
            horizontal
            data={categories}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            className="mb-2"
            contentContainerStyle={{ paddingRight: 8, paddingHorizontal: 20 }}
            onScrollBeginDrag={() => setHasUserScrolled(true)}
            onMomentumScrollBegin={() => setHasUserScrolled(true)}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.35}
            onScrollToIndexFailed={({ index, averageItemLength }) => {
              categoriesListRef.current?.scrollToOffset({
                offset: Math.max(0, index * averageItemLength),
                animated: true,
              });

              scrollFallbackTimeoutRef.current = setTimeout(() => {
                categoriesListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }, 100);
            }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="justify-center pr-2">
                  <ActivityIndicator />
                </View>
              ) : null
            }
            renderItem={({ item: category }) => {
              const isSelected = normalizedSelectedCategoryId === category.id;

              return (
                <Badge
                  key={category.id}
                  title={category.name}
                  variant={isSelected ? "accent" : "secondary"}
                  onPress={() => onCategoryChange(category.id)}
                  className="mr-2"
                />
              );
            }}
          />
          {error ? (
            <Typography className="px-screen text-caption text-accent-red-500 mb-2">
              Выберите категорию
            </Typography>
          ) : null}
        </>
      )}

      <CreateCategoryModal
        visible={createModalVisible}
        userId={auth.userId}
        onClose={() => setCreateModalVisible(false)}
        onCreated={(newCategory) => {
          if (!newCategory) return;
          onCategoryChange(newCategory.id);
        }}
      />

      <Button
        title="Создать новую категорию"
        variant="clear"
        onPress={() => setCreateModalVisible(true)}
        disabled={auth.userId == null}
        rightIcon={
          <StSvg
            name="Add_ring_fill_light"
            size={18}
            color={colors.neutral[900]}
          />
        }
      />
    </>
  );
};

export default ServiceCategorySelect;
