import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  IconButton,
  Button,
  Typography,
  StSvg,
  StModal,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type AuthHeaderProps = {
  showBack?: boolean;
  showSupport?: boolean;
};

export default function AuthHeader({
  showBack = true,
  showSupport = true,
}: AuthHeaderProps) {
  const router = useRouter();
  const [supportVisible, setSupportVisible] = useState(false);

  return (
    <>
      <View className="flex-row items-center justify-between mt-2">
        {showBack ? (
          <IconButton
            icon={
              <StSvg name="Expand_left" size={24} color={colors.neutral[900]} />
            }
            onPress={() => router.back()}
          />
        ) : (
          <View className="w-10" />
        )}

        {showSupport && (
          <IconButton
            icon={
              <StSvg
                name="Headphones_fill"
                size={24}
                color={colors.neutral[900]}
              />
            }
            onPress={() => setSupportVisible(true)}
          />
        )}
      </View>
      <StModal
        visible={supportVisible}
        onClose={() => setSupportVisible(false)}
      >
        <Typography weight="semibold" className="text-body text-center mb-2">
          Нужна помощь?
        </Typography>

        <Typography
          weight="regular"
          className="text-neutral-500 text-body text-center"
        >
          Мы на связи, выбери где удобнее:
        </Typography>

        <View className="flex-row justify-center items-center my-6 gap-10">
          <IconButton
            buttonClassName={"border border-neutral-100"}
            icon={<StSvg name="SocialWhatsApp" size={28} color="#37DB3A" />}
          />
          <IconButton
            buttonClassName={"border border-neutral-100"}
            icon={<StSvg name="SocialTelegram" size={24} color="#37B5DB" />}
          />
        </View>

        <Button
          title="Закрыть"
          onPress={() => {
            setSupportVisible(false);
          }}
        />
      </StModal>
    </>
  );
}
