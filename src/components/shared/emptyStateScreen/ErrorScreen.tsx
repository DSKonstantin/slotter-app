import React from "react";
import EmptyStateScreen from "./EmptyStateScreen";

type ErrorScreenProps = {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  withTabBar?: boolean;
  topInset?: number;
  onRetry: () => void;
};

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title,
  subtitle = "Проверьте подключение к интернету и попробуйте снова",
  isLoading,
  withTabBar = true,
  topInset,
  onRetry,
}) => (
  <EmptyStateScreen
    image={require("@/assets/images/placeholders/no-internet.webp")}
    title={title}
    subtitle={subtitle}
    buttonTitle="Повторить"
    buttonIcon="Refresh_2"
    isLoading={isLoading}
    withTabBar={withTabBar}
    topInset={topInset}
    onPress={onRetry}
  />
);

export default ErrorScreen;
