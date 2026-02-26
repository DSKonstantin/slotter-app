import React, { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { useController, useFormContext } from "react-hook-form";
import { skipToken } from "@reduxjs/toolkit/query";

import { Badge, Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useGetServiceCategoriesInfiniteQuery } from "@/src/store/redux/services/api/servicesApi";
import CreateCategoryModal from "@/src/components/app/menu/services/createCategoryModal";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";

const ServiceCategorySelect = () => {
  const auth = useRequiredAuth();
  const userId = auth?.userId;
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { control } = useFormContext();
  const {
    field: { value: selectedCategoryId, onChange: onCategoryChange },
    fieldState: { error },
  } = useController({
    control,
    name: "categoryId",
  });

  const {
    data,
    isLoading,
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

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const categories = useMemo(() => {
    const unique = new Map<
      number,
      { id: number; name: string; position: number }
    >();

    data?.pages.forEach((page) => {
      page.service_categories.forEach((category) => {
        unique.set(category.id, {
          id: Number(category.id),
          name: category.name,
          position: category.position,
        });
      });
    });

    return [...unique.values()]
      .sort((a, b) => a.position - b.position)
      .map(({ id, name }) => ({ id, name }));
  }, [data?.pages]);

  return (
    <>
      <Typography className="text-caption text-neutral-500 mb-2">
        Категория
      </Typography>

      {isLoading || isFetching ? (
        <Typography className="text-caption text-neutral-500 mb-2">
          Загрузка категорий...
        </Typography>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {categories.map((category) => {
              const normalizedSelectedCategoryId =
                selectedCategoryId === null ? null : Number(selectedCategoryId);
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
            })}
          </ScrollView>
          {error ? (
            <Typography className="text-caption text-accent-red-500 mb-2">
              {String(error.message || "Выберите категорию")}
            </Typography>
          ) : null}
        </>
      )}

      <CreateCategoryModal
        visible={createModalVisible}
        userId={userId ?? 0}
        onClose={() => setCreateModalVisible(false)}
        onCreated={(category) => {
          const createdCategoryId = Number(category.id);
          if (!Number.isNaN(createdCategoryId)) {
            onCategoryChange(createdCategoryId);
          }
          refetch();
        }}
      />

      <Button
        title="Создать новую категорию"
        variant="clear"
        onPress={() => setCreateModalVisible(true)}
        disabled={userId == null}
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
