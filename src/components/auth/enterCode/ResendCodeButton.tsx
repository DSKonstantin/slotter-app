import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { Typography, Button } from "@/src/components/ui";
import { useCountDown } from "@/src/hooks/useCountdown";

type Props = {
  seconds?: number;
  onResend: () => Promise<void> | void;
};

export const ResendCodeButton: React.FC<Props> = ({
  seconds = 30,
  onResend,
}) => {
  const { seconds: timeLeft, start } = useCountDown({
    seconds,
    autoStart: true,
  });

  const [isSending, setIsSending] = useState(false);

  const isFinished = timeLeft === 0;

  const handleResend = useCallback(async () => {
    if (!isFinished || isSending) return;

    try {
      setIsSending(true);
      await onResend();
      start();
    } finally {
      setIsSending(false);
    }
  }, [isFinished, isSending, onResend, start]);

  return (
    <View className="items-center mt-4">
      {!isFinished ? (
        <Typography className="text-center text-caption text-neutral-500">
          Повторить через {timeLeft}с
        </Typography>
      ) : (
        <Button
          title="Отправить код повторно"
          size="sm"
          variant="clear"
          disabled={isSending}
          onPress={handleResend}
        />
      )}
    </View>
  );
};
