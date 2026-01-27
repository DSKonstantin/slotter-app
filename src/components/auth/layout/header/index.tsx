import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  IconButton,
  BottomModal,
  Button,
  Typography,
  StSvg,
} from "@/src/components/ui";

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
            icon={<StSvg name="Expand_left" size={24} color="black" />}
            onPress={() => router.back()}
          />
        ) : (
          <View className="w-10" />
        )}

        {showSupport && (
          <IconButton
            icon={<StSvg name="Headphones_fill" size={24} color="black" />}
            onPress={() => setSupportVisible(true)}
          />
        )}
      </View>
      <BottomModal
        visible={supportVisible}
        onClose={() => setSupportVisible(false)}
      >
        <Typography weight="semibold" className="text-body text-center mb-2">
          Нужна помощь?
        </Typography>

        <Typography className="text-gray text-body text-center">
          Мы на связи, выбери где удобнее:
        </Typography>

        <View className="flex-row justify-center items-center my-6 gap-10">
          <IconButton
            icon={<StSvg name="SocialWhatsApp" size={28} color="#37DB3A" />}
          />
          <IconButton
            icon={<StSvg name="SocialTelegram" size={24} color="#37B5DB" />}
          />
        </View>

        <Button
          title="Закрыть"
          onPress={() => {
            setSupportVisible(false);
          }}
        />
      </BottomModal>
    </>
  );
}
