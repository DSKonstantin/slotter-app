import React from "react";
import { View } from "react-native";

import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

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
        Ошибка загрузки доп. услуг.
      </Typography>
      <Button
        title="Повторить"
        rightIcon={
          <StSvg name="Refresh_2" size={24} color={colors.neutral[0]} />
        }
        onPress={onRetry}
        loading={isFetching}
        disabled={isFetching}
        buttonClassName="w-full"
      />
    </View>
  );
};
