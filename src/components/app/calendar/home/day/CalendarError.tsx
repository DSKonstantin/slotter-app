import React from "react";
import ErrorScreen from "@/src/components/shared/errorScreen";

type CalendarErrorProps = {
  isLoading?: boolean;
  onRetry: () => void;
};

const CalendarError: React.FC<CalendarErrorProps> = ({
  isLoading,
  onRetry,
}) => (
  <ErrorScreen
    title="Не удалось загрузить календарь"
    isLoading={isLoading}
    onRetry={onRetry}
  />
);

export default CalendarError;
