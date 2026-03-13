import React from "react";
import EmptyStateScreen from "@/src/components/shared/emptyStateScreen";
import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type EmptySlotsProps = {
  onPress: () => Promise<void>;
};

const EmptySlots: React.FC<EmptySlotsProps> = ({ onPress }) => (
  <EmptyStateScreen
    image={require("@/assets/images/empty-slots.png")}
    title="На этот день записей нет"
    subtitle="Добавьте первую запись или настройте рабочее время"
    buttonTitle="Добавить запись"
    buttonIcon="Add_round_fill"
    onPress={onPress}
  />
);

export default EmptySlots;
