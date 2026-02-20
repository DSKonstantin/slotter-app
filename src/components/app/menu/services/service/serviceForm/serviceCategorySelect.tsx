import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useSelector } from "react-redux";
import { useFormContext } from "react-hook-form";

import { Badge, Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { RootState } from "@/src/store/redux/store";
import { useGetServiceCategoriesQuery } from "@/src/store/redux/services/api/servicesApi";
import CreateCategoryModal from "@/src/components/app/menu/services/createCategoryModal";
import type { ServiceFormValues } from "@/src/components/app/menu/services/service/serviceForm";

const ServiceCategorySelect = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { setValue, watch } = useFormContext<ServiceFormValues>();
  const selectedCategoryId = watch("categoryId");

  const { data, isLoading, isFetching, refetch } = useGetServiceCategoriesQuery(
    { userId: userId!, params: { view: "with_services" } },
    { skip: !userId },
  );

  const categories = useMemo(
    () =>
      (data?.service_categories ?? []).map((category) => ({
        id: category.id,
        name: category.name,
      })),
    [data],
  );

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
        <View className="flex-row flex-wrap gap-2 mb-2">
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;

            return (
              <Pressable
                key={category.id}
                onPress={() =>
                  setValue("categoryId", category.id, {
                    shouldValidate: true,
                  })
                }
              >
                <Badge
                  title={category.name}
                  variant={isSelected ? "accent" : "secondary"}
                />
              </Pressable>
            );
          })}
        </View>
      )}

      <CreateCategoryModal
        visible={createModalVisible}
        userId={userId ?? 0}
        onClose={() => setCreateModalVisible(false)}
        onCreated={(category) => {
          const createdCategoryId = Number(category.id);
          if (!Number.isNaN(createdCategoryId)) {
            setValue("categoryId", createdCategoryId, {
              shouldValidate: true,
            });
          }
          refetch();
        }}
      />

      <Button
        title="Создать новую категорию"
        variant="clear"
        onPress={() => setCreateModalVisible(true)}
        disabled={!userId}
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
