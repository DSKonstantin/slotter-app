import React, { useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";
import { Button, StModal, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import {
  EditCustomerNameSchema,
  type EditCustomerNameFormValues,
} from "@/src/validation/schemas/editCustomerName.schema";
import { useUpdateUserCustomerMutation } from "@/src/store/redux/services/api/userCustomersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";

type Props = {
  visible: boolean;
  onClose: () => void;
  userCustomerId: number;
  currentName: string;
};

const EditNameModal = ({
  visible,
  onClose,
  userCustomerId,
  currentName,
}: Props) => {
  const auth = useRequiredAuth();
  const [updateUserCustomer, { isLoading }] = useUpdateUserCustomerMutation();

  const methods = useForm<EditCustomerNameFormValues>({
    resolver: yupResolver(EditCustomerNameSchema),
    defaultValues: { name: "" },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (visible) reset({ name: currentName });
  }, [visible, currentName, reset]);

  const onSubmit = useCallback(
    async (values: EditCustomerNameFormValues) => {
      if (!auth) return;
      try {
        await updateUserCustomer({
          userId: auth.userId,
          id: userCustomerId,
          body: { customer: { name: values.name } },
        }).unwrap();
        onClose();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось изменить имя"));
      }
    },
    [auth, updateUserCustomer, userCustomerId, onClose],
  );

  return (
    <StModal visible={visible} onClose={onClose} keyboardAware>
      <FormProvider {...methods}>
        <Typography weight="semibold" className="text-display text-center mb-4">
          Редактировать имя
        </Typography>
        <RhfTextField
          name="name"
          label="Имя клиента"
          placeholder="Введите имя"
          autoFocus
        />
        <Button
          title="Сохранить"
          loading={isLoading}
          disabled={isLoading}
          onPress={handleSubmit(onSubmit)}
          buttonClassName="mt-2"
        />
      </FormProvider>
    </StModal>
  );
};

export default EditNameModal;
