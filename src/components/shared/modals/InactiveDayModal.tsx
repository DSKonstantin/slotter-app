import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { StModal, Typography, Button } from "@/src/components/ui";
import notWorkingImage from "@/assets/images/app/not-working.png";
import { useUpdateWorkingDayMutation } from "@/src/store/redux/services/api/workingDaysApi";
import { formatDayMonthLong } from "@/src/utils/date/formatDate";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  workingDayId?: number;
  userId?: number;
  date?: string;
};

const InactiveDayModal = ({
  visible,
  onClose,
  onSuccess,
  workingDayId,
  userId,
  date,
}: Props) => {
  const [updateWorkingDay, { isLoading }] = useUpdateWorkingDayMutation();

  const dateLabel = date ? formatDayMonthLong(new Date(date)) : "этот день";

  const handleActivate = async () => {
    if (!workingDayId || !userId) return;
    try {
      await updateWorkingDay({
        userId,
        id: workingDayId,
        data: { is_active: true },
      }).unwrap();
      onClose();
      onSuccess?.();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось включить рабочий день"));
    }
  };

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      footer={
        <View className="gap-2">
          <Button
            title="Включить рабочий день"
            variant="accent"
            onPress={handleActivate}
            loading={isLoading}
            disabled={!workingDayId || !userId}
          />
          <Button title="Отмена" variant="clear" onPress={onClose} />
        </View>
      }
    >
      <View className="gap-2 py-2 items-center mb-5">
        <Typography weight="semibold" className="text-display text-center">
          Нерабочий день
        </Typography>
        <Image
          source={notWorkingImage}
          style={{ width: 160, height: 142 }}
          contentFit="contain"
          accessible={false}
        />
        <Typography className="text-body text-center">
          {dateLabel} отмечен как выходной. Создать запись не получится. Хотите
          сделать день рабочим?
        </Typography>
      </View>
    </StModal>
  );
};

export default InactiveDayModal;
