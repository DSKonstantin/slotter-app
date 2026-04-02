import type { CustomerTag } from "@/src/store/redux/services/api-types";
import React from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";

import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import RhfColorPicker from "@/src/components/hookForm/rhf-color-picker";
import { CATEGORY_COLORS } from "@/src/constants/categoryColors";
import { useCreateCustomerTagMutation } from "@/src/store/redux/services/api/customersApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { colors } from "@/src/styles/colors";
import { customerTagSchema } from "@/src/validation/schemas/customerTag.schema";

type Props = {
  visible: boolean;
  userId: number;
  onClose: () => void;
  onCreated: (tag: CustomerTag) => void;
};

const CreateTagModal = ({ visible, userId, onClose, onCreated }: Props) => {
  const methods = useForm({
    resolver: yupResolver(customerTagSchema),
    defaultValues: { name: "", color: null },
  });

  const [createTag, { isLoading }] = useCreateCustomerTagMutation();

  const handleSubmit = methods.handleSubmit(async (values) => {
    try {
      const result = await createTag({
        userId,
        body: {
          name: values.name.trim(),
          color: values.color ?? CATEGORY_COLORS[0].value,
        },
      }).unwrap();

      onCreated(result.customer_tag);
      methods.reset();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось создать тег"));
    }
  });

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <StModal visible={visible} onClose={handleClose} keyboardAware>
      <FormProvider {...methods}>
        <View>
          <Typography weight="semibold" className="text-display text-center">
            Новая категория клиента
          </Typography>

          <View className="gap-4 my-6">
            <RhfTextField
              name="name"
              label="Название"
              hideErrorText
              placeholder="Например: Спящий"
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
            onPress={handleSubmit}
            loading={isLoading}
          />
        </View>
      </FormProvider>
    </StModal>
  );
};

export default React.memo(CreateTagModal);
