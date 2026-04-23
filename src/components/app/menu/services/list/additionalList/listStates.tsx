import React from "react";
import { View } from "react-native";

import { Button, Typography } from "@/src/components/ui";

type AdditionalListErrorStateProps = {
  isFetching: boolean;
  onRetry: () => void;
};

export const AdditionalListErrorState = ({
  isFetching,
  onRetry,
}: AdditionalListErrorStateProps) => {
  return (
    <View
      className="flex-1 items-center justify-center px-screen gap-4"
      accessible={true}
      accessibilityRole="alert"
    >
      <Typography className="text-body text-accent-red-500">
        Ошибка загрузки.
      </Typography>
      <Button
        title="Повторить"
        onPress={onRetry}
        loading={isFetching}
        disabled={isFetching}
        buttonClassName="w-full"
      />
    </View>
  );
};
