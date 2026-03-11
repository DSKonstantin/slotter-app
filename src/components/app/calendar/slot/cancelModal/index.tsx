import React from "react";
import { View } from "react-native";
import { useForm, FormProvider } from "react-hook-form";

import { StModal, Button, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { useCancelAppointmentMutation } from "@/src/store/redux/services/api/appointmentsApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { toast } from "@backpackapp-io/react-native-toast";

type Props = {
  visible: boolean;
  appointmentId: number;
  onClose: () => void;
};

type FormValues = { cancel_reason: string };

const CancelModal = ({ visible, appointmentId, onClose }: Props) => {
  const methods = useForm<FormValues>({ defaultValues: { cancel_reason: "" } });
  const [cancel, { isLoading }] = useCancelAppointmentMutation();

  const handleSubmit = methods.handleSubmit(async (values) => {
    try {
      await cancel({
        id: appointmentId,
        body: { cancel_reason: values.cancel_reason || undefined },
      }).unwrap();
      methods.reset();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось отменить запись"));
    }
  });

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <StModal visible={visible} onClose={handleClose}>
      <FormProvider {...methods}>
        <Typography weight="semibold" className="text-display text-center mb-2">
          Отменить запись?
        </Typography>
        <Typography className="text-body text-neutral-500 text-center mb-6">
          Это действие нельзя отменить
        </Typography>

        <RhfTextField
          name="cancel_reason"
          label="Причина отмены (необязательно)"
          placeholder="Укажите причину..."
          multiline
        />

        <View className="mt-6 gap-3">
          <Button
            title="Отменить запись"
            onPress={handleSubmit}
            loading={isLoading}
          />
          <Button title="Назад" variant="secondary" onPress={handleClose} />
        </View>
      </FormProvider>
    </StModal>
  );
};

export default React.memo(CancelModal);
