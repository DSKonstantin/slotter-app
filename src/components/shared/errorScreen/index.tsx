import React from "react";
import EmptyStateScreen from "@/src/components/shared/emptyStateScreen";

type ErrorScreenProps = {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  withTabBar?: boolean;
  onRetry: () => void;
};

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title,
  subtitle = "Проверьте подключение к интернету и попробуйте снова",
  isLoading,
  withTabBar = true,
  onRetry,
}) => (
  <EmptyStateScreen
    image={require("@/assets/images/placeholders/no-internet.png")}
    title={title}
    subtitle={subtitle}
    buttonTitle="Повторить"
    buttonIcon="Refresh_2"
    isLoading={isLoading}
    withTabBar={withTabBar}
    onPress={onRetry}
  />
);

export default ErrorScreen;
