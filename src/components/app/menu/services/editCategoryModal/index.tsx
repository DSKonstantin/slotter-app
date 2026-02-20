import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import * as Yup from "yup";
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
  useUpdateServiceCategoryMutation,
} from "@/src/store/redux/services/api/servicesApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "@backpackapp-io/react-native-toast";
import map from "lodash/map";

type EditableCategory = {
  id: number;
  name: string;
  color?: string | null;
  services?: any[];
};

type Props = {
  visible: boolean;
  userId: number;
  category: EditableCategory | null;
  onClose: () => void;
  onUpdated: () => void;
};

type FormValues = {
  name: string;
  color?: string;
};

const schema = Yup.object().shape({
  name: Yup.string().required("Введите название категории"),
  color: Yup.string().optional(),
});

const EditCategoryModal = ({
  visible,
  userId,
  category,
  onClose,
  onUpdated,
}: Props) => {
  const { left, right } = useSafeAreaInsets();
  const safeAreaSidePaddingStyle = {
    paddingLeft: left,
    paddingRight: right,
  };
  const horizontalSafeAreaPaddingStyle = {
    paddingLeft: 20 + left,
    paddingRight: 20 + right,
  };

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? undefined,
    },
  });
  const [updateCategory, { isLoading }] = useUpdateServiceCategoryMutation();
  const [deleteService, { isLoading: isServiceDeleting }] =
    useDeleteServiceMutation();

  const handleDeleteService = async (serviceId: number) => {
    if (!category?.id) return;

    try {
      await deleteService({
        categoryId: category.id,
        id: serviceId,
      }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.error || "Не удалось удалить услугу");
    }
  };

  const handleFormSubmit = methods.handleSubmit(async (values) => {
    if (!category) return;

    try {
      await updateCategory({
        userId,
        id: category.id,
        data: {
          name: values.name,
          color: values.color,
        },
      }).unwrap();

      onUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.error || "Не удалось обновить категорию");
    }
  });

  useEffect(() => {
    methods.reset({
      name: category?.name ?? "",
      color: category?.color ?? undefined,
    });
  }, [category, methods]);

  return (
    <StModal visible={visible} onClose={onClose} horizontalPadding={false}>
      <FormProvider {...methods}>
        <Typography
          weight="semibold"
          className="text-display text-center px-screen"
          style={safeAreaSidePaddingStyle}
        >
          Детали категории
        </Typography>

        <View className="gap-4 my-6">
          <View className="mx-screen" style={safeAreaSidePaddingStyle}>
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
              style={safeAreaSidePaddingStyle}
            >
              <Typography className="mb-2 font-inter-medium text-neutral-500 text-caption">
                Входящие услуги
              </Typography>
              <IconButton
                size="xs"
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
                  ...horizontalSafeAreaPaddingStyle,
                }}
              >
                {map(category?.services, (service) => (
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
                ))}
              </ScrollView>
            )}
          </View>

          <View className="mx-screen" style={safeAreaSidePaddingStyle}>
            <Typography className="mb-2 font-inter-medium text-neutral-500 text-caption">
              Цвет
            </Typography>
            <RhfColorPicker name="color" colors={CATEGORY_COLORS} />
          </View>
        </View>

        <Button
          buttonClassName="mx-screen"
          buttonProps={{
            style: safeAreaSidePaddingStyle,
          }}
          title="Сохранить"
          rightIcon={
            <StSvg name="Check_fill" size={24} color={colors.neutral[0]} />
          }
          onPress={handleFormSubmit}
          loading={isLoading}
        />
      </FormProvider>
    </StModal>
  );
};

export default EditCategoryModal;
