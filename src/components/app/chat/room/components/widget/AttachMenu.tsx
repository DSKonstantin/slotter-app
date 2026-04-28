import React from "react";
import { View } from "react-native";
import { Card, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  onPickService: () => void;
  onProposeAppointment: () => void;
};

const AttachMenu = ({ onPickService, onProposeAppointment }: Props) => (
  <View className="gap-2">
    <Card
      title="Прикрепить услугу"
      subtitle="Карточка услуги в чате"
      left={
        <StSvg name="File_dock_fill" size={24} color={colors.neutral[900]} />
      }
      onPress={onPickService}
      right={
        <StSvg
          name="Expand_right_light"
          size={24}
          color={colors.neutral[500]}
        />
      }
    />
    <Card
      title="Предложить запись"
      subtitle="Создаст запись и отправит её клиенту"
      left={<StSvg name="Date_today" size={24} color={colors.neutral[900]} />}
      onPress={onProposeAppointment}
      right={
        <StSvg
          name="Expand_right_light"
          size={24}
          color={colors.neutral[500]}
        />
      }
    />
  </View>
);

export default AttachMenu;
