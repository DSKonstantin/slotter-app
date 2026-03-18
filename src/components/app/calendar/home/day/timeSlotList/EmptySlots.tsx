import React from "react";
import EmptyStateScreen from "@/src/components/shared/emptyStateScreen";

type EmptySlotsProps = {
  isLoading?: boolean;
  onPress: () => void;
};

const EmptySlots: React.FC<EmptySlotsProps> = ({ isLoading, onPress }) => (
  <EmptyStateScreen
    image={require("@/assets/images/empty-slots.png")}
    title="На этот день записей нет"
    subtitle="Добавьте первую запись или настройте рабочее время"
    buttonTitle="Добавить запись"
    buttonIcon="Add_round_fill"
    isLoading={isLoading}
    onPress={onPress}
  />
);

export default EmptySlots;
