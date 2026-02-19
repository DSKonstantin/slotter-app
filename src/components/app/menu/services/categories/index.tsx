import React, { useEffect, useCallback, useState } from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import { useSelector } from "react-redux";

import ToolbarTop from "@/src/components/navigation/toolbarTop";
import {
  Button,
  Card,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";

import { colors } from "@/src/styles/colors";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";

import { useGetServiceCategoriesQuery } from "@/src/store/redux/services/api/servicesApi";

import { RootState } from "@/src/store/redux/store";
import CreateCategoryModal from "@/src/components/app/menu/services/createCategoryModal";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

// ========================
// TYPES
// ========================

type CategoryForm = {
  id: string;
  name: string;
  servicesCount: number;
};

type FormValues = {
  categories: CategoryForm[];
};

// ========================
// COMPONENT
// ========================

const AppServicesCategories = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { top } = useSafeAreaInsets();

  const user = useSelector((state: RootState) => state.auth.user);

  const userId = user?.id;

  // ========================
  // API
  // ========================

  const { data, isLoading, isFetching, refetch } = useGetServiceCategoriesQuery(
    { userId: userId! },
    {
      skip: !userId,
    },
  );
  // ========================
  // FORM
  // ========================

  const methods = useForm<FormValues>({
    defaultValues: {
      categories: [],
    },
  });

  const { control } = methods;

  const { fields, replace, remove } = useFieldArray({
    control,
    name: "categories",
  });

  // ========================
  // SYNC API → FORM
  // ========================

  useEffect(() => {
    if (!data?.service_categories) return;

    const formatted = data.service_categories.map(
      (category): CategoryForm => ({
        id: String(category.id),
        name: category.name,
        servicesCount: category.services_count ?? 0,
      }),
    );

    replace(formatted);
  }, [data, replace]);

  // ========================
  // LOADING
  // ========================

  if (isLoading || isFetching) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  // ========================
  // UI
  // ========================

  return (
    <>
      <ToolbarTop
        title="Категории услуг"
        rightButton={
          <IconButton
            icon={<StSvg name="Search" size={28} color={colors.neutral[900]} />}
            onPress={() => {}}
          />
        }
      />

      <FormProvider {...methods}>
        <View
          className="flex-1 px-screen"
          style={{
            marginTop: TOOLBAR_HEIGHT + top,
          }}
        >
          <Typography className="text-caption text-neutral-500 mb-2">
            Существующие категории
          </Typography>

          <View className="gap-2">
            {fields.map((category) => (
              <Card
                key={category.id}
                title={category.name}
                subtitle={`${category.servicesCount} услуг`}
                rightIcon={
                  <StSvg
                    name="Edit_light"
                    size={24}
                    color={colors.neutral[500]}
                  />
                }
                onPress={() =>
                  router.push(
                    Routers.app.menu.services.categoryEdit(category.id),
                  )
                }
              />
            ))}
          </View>

          <Button
            title="Создать новую категорию"
            variant="clear"
            onPress={() => setCreateModalVisible(true)}
            rightIcon={
              <StSvg
                name="Add_ring_fill_light"
                size={18}
                color={colors.neutral[900]}
              />
            }
          />
        </View>
      </FormProvider>
      <CreateCategoryModal
        visible={createModalVisible}
        userId={userId!}
        onClose={() => setCreateModalVisible(false)}
        onCreated={() => refetch()}
      />
    </>
  );
};

export default AppServicesCategories;
