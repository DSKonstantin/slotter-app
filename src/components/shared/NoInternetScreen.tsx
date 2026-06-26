import React from "react";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

interface Props {
  onRetry: () => void;
  isRetrying?: boolean;
}

const NoInternetScreen: React.FC<Props> = ({ onRetry, isRetrying }) => {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: top, paddingBottom: bottom + 8 }}
    >
      <View className="flex-1 items-center justify-center gap-4 px-screen">
        <Image
          source={require("@/assets/images/placeholders/no-internet.png")}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
        <View className="items-center gap-1">
          <Typography
            weight="semibold"
            className="text-display text-neutral-900 text-center mb-1"
          >
            Нет соединения
          </Typography>
          <Typography className="text-body text-neutral-500 text-center">
            Проверьте подключение к интернету и попробуйте снова
          </Typography>
        </View>
      </View>
      <View className="px-screen">
        <Button
          title="Повторить"
          loading={isRetrying}
          onPress={onRetry}
          rightIcon={
            <StSvg name="Refresh_2" size={24} color={colors.neutral[0]} />
          }
        />
      </View>
    </View>
  );
};

export default NoInternetScreen;
