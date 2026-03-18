import React from "react";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { View } from "react-native";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { colors } from "@/src/styles/colors";

interface DateSelectorModalProps {
  modalDate: Date | null;
  onClose: () => void;
  onCreatePress: () => void;
}

const DateSelectorModal = ({
  modalDate,
  onClose,
  onCreatePress,
}: DateSelectorModalProps) => {
  return (
    <StModal visible={!!modalDate} onClose={onClose}>
      <View className="gap-3">
        <Typography
          weight="semibold"
          className="mt-2.5 text-display text-center"
        >
          {modalDate ? format(modalDate, "d MMMM yyyy", { locale: ru }) : ""}
        </Typography>

        <View className="my-4 items-center gap-2">
          <StSvg name="Calendar_fill" size={48} color={colors.neutral[400]} />
          <Typography className="text-body">
            Записей на этот день нет
          </Typography>
        </View>

        <Button
          title="Добавить запись"
          variant="secondary"
          textVariant="accent"
          rightIcon={
            <StSvg
              name="Add_round_fill"
              size={24}
              color={colors.primary.blue[500]}
            />
          }
          onPress={onCreatePress}
        />
        <Button title="Готово" onPress={onClose} />
      </View>
    </StModal>
  );
};

export default DateSelectorModal;
