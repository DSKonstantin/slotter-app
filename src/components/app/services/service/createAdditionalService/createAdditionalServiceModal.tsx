import React from "react";
import { StModal, Typography } from "@/src/components/ui";
import { FormProvider, useForm } from "react-hook-form";
import AdditionalServicesForm from "@/src/components/app/services/additionalServices/additionalServicesForm";
import { useCreateAdditionalServiceMutation } from "@/src/store/redux/services/api/additionalServicesApi";
import { toast } from "@backpackapp-io/react-native-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { additionalServiceFormSchema } from "@/src/validation/schemas/additionalServiceForm.schema";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";

type AdditionalServiceFormValues = {
  name: string;
  description: string;
  price: string;
  duration: string;
  isActive: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated?: (serviceId: number) => void;
};

const CreateAdditionalServiceModal = ({
  visible,
  onClose,
  onCreated,
}: Props) => {
  const auth = useRequiredAuth();
  const [createAdditionalService, { isLoading }] =
    useCreateAdditionalServiceMutation();

  const methods = useForm<AdditionalServiceFormValues>({
    resolver: yupResolver(additionalServiceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      duration: "0",
      isActive: true,
    },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    if (!auth?.userId) return;

    try {
      const service = await createAdditionalService({
        userId: auth.userId,
        data: {
          name: values.name.trim(),
          description: values.description,
          duration: Number(values.duration),
          price: Number(values.price),
          is_active: values.isActive,
        },
      }).unwrap();

      onCreated?.(service.id);
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось создать доп. услугу"));
    }
  });

  if (!auth) return null;

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      horizontalPadding={false}
      header={
        <Typography weight="semibold" className="text-display text-center mb-4">
          Создать доп. услугу
        </Typography>
      }
    >
      <FormProvider {...methods}>
        <AdditionalServicesForm
          insets={{ topInset: 0, bottomInset: 0 }}
          loading={isLoading}
          loadingDelete={false}
          onSubmit={onSubmit}
        />
      </FormProvider>
    </StModal>
  );
};

export default CreateAdditionalServiceModal;
