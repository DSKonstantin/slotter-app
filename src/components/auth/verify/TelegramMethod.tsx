import React from "react";
import { View } from "react-native";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type TelegramMethodProps = {
  onPress: () => void;
  pending?: boolean;
  disabled?: boolean;
};

export function TelegramMethod({
  onPress,
  pending = false,
  disabled = false,
}: TelegramMethodProps) {
  return (
    <View>
      <Button
        title="Получить код в Telegram"
        variant="accent"
        loading={pending}
        disabled={disabled}
        rightIcon={
          <StSvg
            name="SocialTelegram"
            size={20}
            color={colors.secondary.DEFAULT}
          />
        }
        onPress={onPress}
      />
      <Typography className="text-caption text-neutral-500 text-center mt-3">
        Бот Slotter пришлёт код для входа
      </Typography>
    </View>
  );
}
