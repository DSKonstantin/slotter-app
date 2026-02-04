import { View } from "react-native";
import { useEffect, useState } from "react";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { Typography } from "@/src/components/ui";
import { ResendCodeButton } from "@/src/components/auth/enterCode/ResendCodeButton";

type OtpConfirmProps = {
  length?: number;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

export function OtpConfirm({
  length = 6,
  onChange,
  onComplete,
}: OtpConfirmProps) {
  const [value, setValue] = useState("");

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
              isFocused ? "border-primary bg-neutral-100" : "border-neutral-300"
            }`}
          >
            <Typography className="text-lg">
              {symbol || (isFocused ? <Cursor /> : null)}
            </Typography>
          </View>
        )}
      />

      <ResendCodeButton
        seconds={30}
        onResend={async () => {
          console.log("RESEND");
        }}
      />
    </>
  );
}
