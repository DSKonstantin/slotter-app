import { View } from "react-native";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { Button, Typography } from "@/src/components/ui";

type OtpConfirmProps = {
  length?: number;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

const RESEND_TIMEOUT = 30 * 1000;

export function OtpConfirm({
  length = 6,
  onChange,
  onComplete,
}: OtpConfirmProps) {
  const [value, setValue] = useState("");
  const [countdownKey, setCountdownKey] = useState(0);

  const ref = useBlurOnFulfill({ value, cellCount: length });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    onChange(value);
  }, [onChange, value]);

  return (
    <>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        autoFocus
        onChangeText={(text) => {
          setValue(text);

          if (text.length === length) {
            onComplete?.(text);
          }
        }}
        cellCount={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        rootStyle={{ gap: 16 }}
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            style={{ flex: 1, aspectRatio: 1 }}
            className={`items-center justify-center rounded-xl border ${
              isFocused ? "border-primary bg-gray-lighter" : "border-gray-muted"
            }`}
          >
            <Typography className="text-lg">
              {symbol || (isFocused ? <Cursor /> : null)}
            </Typography>
          </View>
        )}
      />

      <Countdown
        key={countdownKey}
        date={Date.now() + RESEND_TIMEOUT}
        renderer={({ seconds, completed }) =>
          !completed ? (
            <Typography className="mt-4 text-center text-caption text-gray">
              Отправить повторно через {seconds} сек
            </Typography>
          ) : (
            <View className="mt-4">
              <Button
                size="sm"
                title="Отправить код повторно"
                onPress={() => setCountdownKey((k) => k + 1)}
              />
            </View>
          )
        }
      />
    </>
  );
}
