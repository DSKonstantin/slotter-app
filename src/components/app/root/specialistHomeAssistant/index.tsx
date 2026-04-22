import React from "react";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { CopyLinkButton } from "@/src/components/shared/copyLinkButton";
import { colors } from "@/src/styles/colors";
import { useAppSelector } from "@/src/store/redux/store";

const SpecialistHomeAssistant = () => {
  const personalLink = useAppSelector(
    (s) => s.auth.user?.personal_link ?? "",
  );

  if (!personalLink) return null;

  return (
    <View className="bg-background-card rounded-base">
      <View className="flex-row items-center gap-1">
        <StSvg name="Check_round_fill" size={20} color={colors.neutral[900]} />
        <Typography weight="semibold" className="text-xl">
          Ваша страница готова
        </Typography>
      </View>

      <Typography weight="semibold" className="text-xl mb-3">
        Поделитесь ссылкой, чтобы начать принимать записи
      </Typography>

      <CopyLinkButton link={personalLink} />
    </View>
  );
};

export default SpecialistHomeAssistant;
