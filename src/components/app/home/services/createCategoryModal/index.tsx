import React from "react";
import { Alert, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { StModal, Button, Typography, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { useCreateServiceCategoryMutation } from "@/src/store/redux/services/api/servicesApi";
import { colors } from "@/src/styles/colors";
import RhfColorPicker from "@/src/components/hookForm/rhf-color-picker";
import { CATEGORY_COLORS } from "@/src/constants/categoryColors";

// ========================
// TYPES
// ========================
type Props = {
  visible: boolean;
  userId: number;
  onClose: () => void;
  onCreated: (category: {
    id: string;
    name: string;
    servicesCount: number;
  }) => void;
};

type FormValues = {
  name: string;
  color?: string;
};

// ========================
// VALIDATION SCHEMA
// ========================
const schema = Yup.object().shape({
  name: Yup.string().required("Введите название категории"),
  color: Yup.string().optional(),
});

// ========================
// COMPONENT
// ========================
const CreateCategoryModal = ({
  visible,
  userId,
  onClose,
  onCreated,
}: Props) => {
  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      color: undefined,
    },
  });

  const [createCategory, { isLoading }] = useCreateServiceCategoryMutation();

  const handleFormSubmit = methods.handleSubmit(async (values) => {
    try {
      const result = await createCategory({
        userId,
        data: {
          name: values.name,
        },
      }).unwrap();

      onCreated({
        id: String(result.id),
        name: result.name,
        servicesCount: 0,
      });

      methods.reset();
      onClose();
    } catch {
      Alert.alert("Ошибка", "Не удалось создать категорию");
    }
  });

  return (
    <StModal visible={visible} onClose={onClose}>
      <FormProvider {...methods}>
        <Typography weight="semibold" className="text-display text-center">
          Новая категория услуг
        </Typography>

        <View className="gap-4 my-6">
          <RhfTextField
            name="name"
            label="Название категории"
            placeholder="Например: Стрижки"
          />

          <View>
            <Typography className="mb-2 font-inter-medium text-neutral-500 text-caption">
              Цвет
            </Typography>
            <RhfColorPicker name="color" colors={CATEGORY_COLORS} />
          </View>
        </View>

        <Button
          title="Создать"
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

export default CreateCategoryModal;
