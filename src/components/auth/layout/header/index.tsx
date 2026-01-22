import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  IconButton,
  BottomModal,
  Button,
  Typography,
} from "@/src/components/ui";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

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
      <View className="flex-row items-center justify-between">
        {showBack ? (
          <IconButton
            icon={
              <Ionicons name="chevron-back-sharp" size={28} color="black" />
            }
            onPress={() => router.back()}
          />
        ) : (
          <View className="w-10" />
        )}

        {showSupport && (
          <IconButton
            icon={<Fontisto name="headphone" size={28} color="black" />}
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

        <View className="flex-row justify-center items-center my-6">
          <IconButton
            icon={<FontAwesome5 name="whatsapp" size={28} color="#37DB3A" />}
          />
          <IconButton
            icon={
              <FontAwesome5 name="telegram-plane" size={28} color="#37B5DB" />
            }
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
