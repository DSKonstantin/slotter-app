import React, { useEffect, useState } from "react";
import { ScrollView, View, Alert } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  StModal,
  Button,
  Typography,
  StSvg,
  IconButton,
} from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { colors } from "@/src/styles/colors";
import RhfColorPicker from "@/src/components/hookForm/rhf-color-picker";
import { CATEGORY_COLORS } from "@/src/constants/categoryColors";
import {
  useDeleteServiceMutation,
  useDeleteServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
} from "@/src/store/redux/services/api/servicesApi";
import { useSafeAreaPadding } from "@/src/hooks/useSafeAreaPadding";
import { toast } from "@backpackapp-io/react-native-toast";
import map from "lodash/map";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import categorySchema from "@/src/validation/schemas/category.schema";
import type { Service } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";

type EditableCategory = {
  id: number;
  name: string;
  color?: string | null;
  services?: Service[];
};

type Props = {
  visible: boolean;
  userId: number;
  category: EditableCategory | null;
  onClose: () => void;
};

const EditCategoryModal = ({ visible, userId, category, onClose }: Props) => {
  const { sidePadding, horizontalPadding } = useSafeAreaPadding();
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

  const methods = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? undefined,
    },
  });
  const [updateCategory, { isLoading }] = useUpdateServiceCategoryMutation();
  const [deleteService, { isLoading: isServiceDeleting }] =
    useDeleteServiceMutation();
  const [deleteCategory, { isLoading: isDeletingCategory }] =
    useDeleteServiceCategoryMutation();

  const handleDeleteService = (serviceId: number) => {
    setPendingDeleteIds((prev) => [...prev, serviceId]);
  };

  const handleFormSubmit = methods.handleSubmit(async (values) => {
    if (!category) return;

    const save = async () => {
      try {
        await updateCategory({
          userId,
          id: category.id,
          data: {
            name: values.name,
            color: values.color ?? undefined,
          },
        }).unwrap();

        if (pendingDeleteIds.length > 0) {
          const results = await Promise.allSettled(
            pendingDeleteIds.map((id) =>
              deleteService({ categoryId: category.id, id }).unwrap(),
            ),
          );
          const failed = results.filter((r) => r.status === "rejected");
          if (failed.length > 0) {
            const reason = (failed[0] as PromiseRejectedResult).reason;
            toast.error(
              reason?.data?.error || "Не удалось удалить некоторые услуги",
            );
          }
        }

        onClose();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Не удалось сохранить изменения"),
        );
      }
    };

    if (pendingDeleteIds.length > 0) {
      Alert.alert(
        "Сохранить изменения?",
        `Будет удалено ${pendingDeleteIds.length} ${pendingDeleteIds.length === 1 ? "услуга" : "услуги"}`,
        [
          { text: "Отмена", style: "cancel" },
          { text: "Сохранить", onPress: save },
        ],
      );
    } else {
      await save();
    }
  });

  const handleCreateServicePress = () => {
    if (!category?.id) return;
    onClose();
    router.push(Routers.app.menu.services.create(category.id));
  };

  const handleDeleteCategory = () => {
    if (!category?.id) return;

    Alert.alert("Удалить категорию?", "Это действие нельзя отменить", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory({
              userId,
              id: category.id,
            }).unwrap();

            onClose();
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Не удалось удалить категорию"),
            );
          }
        },
      },
    ]);
  };

  useEffect(() => {
    methods.reset({
      name: category?.name ?? "",
      color: category?.color ?? undefined,
    });
    setPendingDeleteIds([]);
  }, [category, methods]);

  return (
    <StModal visible={visible} onClose={onClose} horizontalPadding={false}>
      <FormProvider {...methods}>
        <Typography
          weight="semibold"
          className="text-display text-center px-screen"
          style={sidePadding}
        >
          Детали категории
        </Typography>

        <View className="gap-4 my-6">
          <View className="mx-screen" style={sidePadding}>
            <RhfTextField
              name="name"
              label="Название категории"
              hideErrorText
              placeholder="Например: Стрижки"
            />
          </View>

          <View>
            <View
              className="flex-row items-center justify-between mx-screen"
              style={sidePadding}
            >
              <Typography className="mb-2 font-inter-medium text-neutral-500 text-caption">
                Входящие услуги
              </Typography>
              <IconButton
                size="xs"
                onPress={handleCreateServicePress}
                accessibilityLabel="Add service"
                icon={
                  <StSvg
                    name="Add_round"
                    size={16}
                    color={colors.neutral[900]}
                  />
                }
              />
            </View>

            {category?.services && category?.services?.length > 0 && (
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 8,
                  alignItems: "center",
                  paddingVertical: 8,
                  ...horizontalPadding,
                }}
              >
                {map(
                  category?.services?.filter(
                    (s) => !pendingDeleteIds.includes(s.id),
                  ),
                  (service) => (
                    <Button
                      key={service.id}
                      title={service.name}
                      variant="secondary"
                      size="sm"
                      disabled={isServiceDeleting}
                      buttonClassName="rounded-xl border border-neutral-200 px-2.5"
                      rightIcon={
                        <StSvg
                          name="Close_round_light"
                          size={20}
                          color={colors.neutral[900]}
                        />
                      }
                      onPress={() => handleDeleteService(service.id)}
                    />
                  ),
                )}
              </ScrollView>
            )}
          </View>

          <View className="mx-screen" style={sidePadding}>
            <Typography className="mb-2 font-inter-medium text-neutral-500 text-caption">
              Цвет
            </Typography>
            <RhfColorPicker name="color" colors={CATEGORY_COLORS} />
          </View>
        </View>

        <View className="gap-2">
          <Button
            buttonClassName="mx-screen"
            buttonProps={{
              style: sidePadding,
            }}
            title="Сохранить"
            rightIcon={
              <StSvg name="Check_fill" size={24} color={colors.neutral[0]} />
            }
            onPress={handleFormSubmit}
            loading={isLoading}
          />

          <Button
            buttonClassName="mx-screen"
            variant="clear"
            textClassName="text-accent-red-500"
            rightIcon={
              <StSvg name="Trash" size={24} color={colors.accent.red[500]} />
            }
            buttonProps={{
              style: sidePadding,
            }}
            title="Удалить категорию"
            disabled={isDeletingCategory}
            loading={isDeletingCategory}
            onPress={handleDeleteCategory}
          />
        </View>
      </FormProvider>
    </StModal>
  );
};

export default React.memo(EditCategoryModal);
