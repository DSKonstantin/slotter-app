import React, { useState } from "react";
import { Linking, View } from "react-native";
import { Image } from "expo-image";
import { Badge, Button, StModal, Typography } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/redux/store";

const FEATURES: string[] = [
  "Теперь вы можете поменять свой @никнейм прямо из настроек.",
  "Видите свой текущий план сразу на главном экране аккаунта.",
  "Отдельный экран для имени, фамилии и специальности — раньше это было разбросано по настройкам.",
];

const AppUpdateModal: React.FC = () => {
  const { updateStatus, storeUrl } = useAppSelector((s) => s.appVersion);
  const [dismissed, setDismissed] = useState(false);

  const isBlocking = updateStatus === "red";
  const visible = isBlocking || (updateStatus === "yellow" && !dismissed);

  const handleUpdate = () => {
    if (storeUrl) {
      void Linking.openURL(storeUrl);
    }
  };

  return (
    <StModal visible={visible} onClose={() => setDismissed(true)}>
      <Image
        source={require("@/assets/images/app/update-modal.webp")}
        contentFit="cover"
        style={{
          width: "100%",
          height: 224,
          borderRadius: 16,
        }}
      />

      <Typography weight="semibold" className="text-display my-5">
        Обновили личный кабинет
      </Typography>

      <View className="gap-3 mb-6">
        {FEATURES.map((description) => (
          <Typography weight="regular" key={description} className="text-body">
            {description}
          </Typography>
        ))}
      </View>

      <Button
        title="Обновить приложение"
        variant="secondary"
        leftIcon={
          <Badge
            title="New"
            size="sm"
            variant="success"
            className="self-center"
          />
        }
        onPress={handleUpdate}
      />
    </StModal>
  );
};

export default AppUpdateModal;
