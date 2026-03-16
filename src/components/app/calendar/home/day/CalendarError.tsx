import React from "react";
import EmptyStateScreen from "@/src/components/shared/emptyStateScreen";

type CalendarErrorProps = {
  isLoading?: boolean;
  onRetry: () => void;
};

const CalendarError: React.FC<CalendarErrorProps> = ({
  isLoading,
  onRetry,
}) => (
  <EmptyStateScreen
    image={require("@/assets/images/no-internet.png")}
    title="Не удалось загрузить календарь"
    subtitle="Проверьте подключение к интернету и попробуйте снова"
    buttonTitle="Повторить"
    buttonIcon="Refresh_2"
    isLoading={isLoading}
    onPress={onRetry}
  />
);

export default CalendarError;
