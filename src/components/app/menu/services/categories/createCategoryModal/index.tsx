import React from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { StModal, Button, Typography, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { useCreateServiceCategoryMutation } from "@/src/store/redux/services/api/servicesApi";
import { colors } from "@/src/styles/colors";
import RhfColorPicker from "@/src/components/hookForm/rhf-color-picker";
import { CATEGORY_COLORS } from "@/src/constants/categoryColors";
import { toast } from "@backpackapp-io/react-native-toast";
import categorySchema from "@/src/validation/schemas/category.schema";
import type { ServiceCategory } from "@/src/store/redux/services/api-types";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type Props = {
  visible: boolean;
  userId: number;
  onClose: () => void;
  onCreated?: (category?: ServiceCategory) => void;
};

const CreateCategoryModal = ({
  visible,
  userId,
  onClose,
  onCreated,
}: Props) => {
  const methods = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: "",
      color: null,
    },
  });

  const [createCategory, { isLoading }] = useCreateServiceCategoryMutation();

  const handleFormSubmit = methods.handleSubmit(async (values) => {
    try {
      const createdCategory = await createCategory({
        userId,
        data: {
          name: values.name,
          is_active: true,
          color: values.color,
        },
      }).unwrap();

      onCreated?.(createdCategory?.service_category);
      methods.reset();
      onClose();
    } catch (e: any) {
      toast.error(e?.data?.error || "Не удалось создать категорию");
    }
  });

  return (
    <StModal visible={visible} onClose={onClose}>
      <FormProvider {...methods}>
        <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
          <Typography weight="semibold" className="text-display text-center">
            Новая категория услуг
          </Typography>

          <View className="gap-4 my-6">
            <RhfTextField
              name="name"
              label="Название категории"
              hideErrorText
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
        </KeyboardAwareScrollView>
      </FormProvider>
    </StModal>
  );
};

export default CreateCategoryModal;
