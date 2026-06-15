import React, { memo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { CopyLinkButton } from "@/src/components/shared/copyLinkButton";
import { LinkView } from "@/src/components/shared/linkView";

type Props = {
  nickname: string;
  hasTodaySchedule: boolean;
};

function AfterOnboardingComponent({ nickname, hasTodaySchedule }: Props) {
  const link = `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${nickname}`;
  const displayLink = `${process.env.EXPO_PUBLIC_BOOKING_DISPLAY_URL}/${nickname}`;

  if (!hasTodaySchedule) {
    return (
      <View>
        <View className="flex-row items-center gap-1">
          <StSvg
            name="Check_round_fill"
            size={20}
            color={colors.neutral[900]}
          />
          <Typography weight="semibold" className="text-lg">
            Твоя страница готова
          </Typography>
        </View>
        <Typography weight="semibold" className="text-lg mb-3">
          Расписание не настроено. Клиенты не могут к вам записаться. Откройте
          его в разделе{" "}
          <Typography weight="extrabold" className="text-lg">
            График
          </Typography>{" "}
          или по кнопке ниже.
        </Typography>
        <LinkView
          link="Открыть график"
          iconName="Arrow_alt_lright"
          onPress={() => router.push(Routers.app.schedule)}
        />
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-center gap-1">
        <StSvg name="Check_round_fill" size={20} color={colors.neutral[900]} />
        <Typography weight="semibold" className="text-xl">
          Твоя страница готова
        </Typography>
      </View>
      <Typography weight="semibold" className="text-xl mb-3">
        Поделитесь ссылкой, чтобы начать принимать записи
      </Typography>
      <CopyLinkButton link={link} displayLink={displayLink} />
    </View>
  );
}

export default memo(AfterOnboardingComponent);
