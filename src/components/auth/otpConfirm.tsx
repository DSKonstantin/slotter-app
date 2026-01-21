import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { Button } from "@/src/components/ui";

type OtpConfirmProps = {
  length?: number;
  onComplete?: (code: string) => void;
};

const RESEND_TIMEOUT = 30 * 1000;

export function OtpConfirm({ length = 6, onComplete }: OtpConfirmProps) {
  const [value, setValue] = useState("");
  const [countdownKey, setCountdownKey] = useState(0);

  const ref = useBlurOnFulfill({ value, cellCount: length });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    if (value.length === length) {
      onComplete?.(value);
    }
  }, [value, length, onComplete]);

  return (
    <>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        autoFocus={true}
        onChangeText={setValue}
        cellCount={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            className={`h-12 w-12 items-center justify-center rounded-xl border ${
              isFocused ? "border-sky-500" : "border-gray-300"
            } bg-white`}
          >
            <Text className="text-lg">
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />

      <Countdown
        key={countdownKey}
        date={Date.now() + RESEND_TIMEOUT}
        renderer={({ seconds, completed }) =>
          !completed ? (
            <Text className="mt-4 text-center text-sm text-gray-500">
              Отправить повторно через {seconds} сек
            </Text>
          ) : (
            <View className="mt-4">
              <Button
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
