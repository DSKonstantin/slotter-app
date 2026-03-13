import React from "react";
import EmptyStateScreen from "@/src/components/shared/emptyStateScreen";

type CalendarErrorProps = {
  onRetry: () => Promise<void>;
};

const CalendarError: React.FC<CalendarErrorProps> = ({ onRetry }) => (
  <EmptyStateScreen
    image={require("@/assets/images/no-internet.png")}
    title="Не удалось загрузить календарь"
    subtitle="Проверьте подключение к интернету и попробуйте снова"
    buttonTitle="Повторить"
    buttonIcon="Refresh_2"
    onPress={onRetry}
  />
);

export default CalendarError;
