import React from "react";
import { View } from "react-native";
import { Typography, Button } from "@/src/components/ui";
import { useCountdown } from "@/src/hooks/useCountdown";

type Props = {
  seconds?: number;
  onResend: () => Promise<void> | void;
};

export const ResendCodeButton: React.FC<Props> = ({
  seconds = 30,
  onResend,
}) => {
  const timer = useCountdown(seconds);

  const disabled = !timer.isFinished;

  return (
    <View className="items-center mt-4">
      {!timer.isFinished && (
        <Typography
          weight="medium"
          className="text-center text-caption text-neutral-500"
        >
          Повторить через {timer.secondsLeft}с
        </Typography>
      )}

      <Button
        title={
          timer.isFinished
            ? "Отправить код повторно"
            : `Повтор через ${timer.secondsLeft}`
        }
        size="sm"
        variant="clear"
        disabled={disabled}
        onPress={async () => {
          if (disabled) return;

          await onResend();
          timer.restart();
        }}
      />
    </View>
  );
};
