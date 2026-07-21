import React from "react";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type * as Sentry from "@sentry/react-native";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const CrashFallback: NonNullable<
  Sentry.GlobalErrorBoundaryProps["fallback"]
> = ({ error, resetError }) => {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: top, paddingBottom: bottom + 8 }}
    >
      <View className="flex-1 items-center justify-center gap-4 px-screen">
        <Image
          source={require("@/assets/images/placeholders/no-internet.webp")}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
        <View className="items-center gap-1">
          <Typography
            weight="semibold"
            className="text-display text-neutral-900 text-center mb-1"
          >
            Что-то пошло не так
          </Typography>
          <Typography className="text-body text-neutral-500 text-center">
            Мы уже получили отчёт об ошибке. Попробуйте ещё раз.
          </Typography>
          {__DEV__ && (
            <Typography className="text-caption text-neutral-400 text-center mt-2">
              {String(error)}
            </Typography>
          )}
        </View>
      </View>
      <View className="px-screen">
        <Button
          title="Повторить"
          onPress={resetError}
          rightIcon={
            <StSvg name="Refresh_2" size={24} color={colors.neutral[0]} />
          }
        />
      </View>
    </View>
  );
};

export default CrashFallback;
