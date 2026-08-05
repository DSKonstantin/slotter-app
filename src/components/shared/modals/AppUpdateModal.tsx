import React, { useState } from "react";
import { Linking, View } from "react-native";
import { Image } from "expo-image";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useAppSelector } from "@/src/store/redux/store";

type FeatureItem = {
  icon: React.ComponentProps<typeof StSvg>["name"];
  title: string;
  description: string;
};

const FEATURES: FeatureItem[] = [
  {
    icon: "link_alt",
    title: "Никнейм профиля",
    description: "Теперь вы можете поменять свой @никнейм прямо из настроек",
  },
  {
    icon: "Credit_card",
    title: "Тариф в профиле",
    description: "Видите свой текущий план сразу на главном экране аккаунта",
  },
  {
    icon: "Edit",
    title: "Редактирование данных",
    description:
      "Отдельный экран для имени, фамилии и специальности — раньше это было разбросано по настройкам",
  },
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
    <StModal
      visible={visible}
      onClose={isBlocking ? () => {} : () => setDismissed(true)}
      {...(isBlocking && {
        onBackdropPress: () => {},
        swipeDirection: undefined,
      })}
    >
      <Image
        source={require("@/assets/images/app/update-modal.webp")}
        contentFit="cover"
        style={{
          width: "100%",
          height: 224,
          borderRadius: 16,
        }}
      />

      <Typography weight="semibold" className="text-display text-center my-5">
        Обновили личный кабинет
      </Typography>

      <View className="gap-4 mb-6">
        {FEATURES.map((feature) => (
          <View key={feature.title}>
            <View className="flex-row items-center gap-2 mb-1">
              <StSvg
                name={feature.icon}
                size={20}
                color={colors.neutral[900]}
              />
              <Typography weight="semibold" className="text-body">
                {feature.title}
              </Typography>
            </View>
            <Typography
              weight="medium"
              className="text-caption text-neutral-500"
            >
              {feature.description}
            </Typography>
          </View>
        ))}
      </View>

      <View className="gap-3">
        <Button
          title="Обновить приложение"
          variant="accent"
          onPress={handleUpdate}
        />
      </View>
    </StModal>
  );
};

export default AppUpdateModal;
