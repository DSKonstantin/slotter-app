import React, { memo } from "react";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { CopyLinkButton } from "@/src/components/shared/copyLinkButton";
import { colors } from "@/src/styles/colors";

type Props = { nickname: string };

function ShareLinkVariantComponent({ nickname }: Props) {
  const link = `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${nickname}`;
  const displayLink = `${process.env.EXPO_PUBLIC_BOOKING_DISPLAY_URL}/${nickname}`;

  return (
    <View>
      <View className="flex-row items-center gap-1">
        <StSvg name="Check_round_fill" size={20} color={colors.neutral[900]} />
        <Typography weight="semibold" className="text-xl">
          Ваша страница готова
        </Typography>
      </View>
      <Typography weight="semibold" className="text-xl mb-3">
        Поделитесь ссылкой, чтобы начать принимать записи
      </Typography>
      <CopyLinkButton link={link} displayLink={displayLink} />
    </View>
  );
}

export default memo(ShareLinkVariantComponent);
