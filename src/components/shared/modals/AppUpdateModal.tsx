import React, { useState } from "react";
import { Linking, View } from "react-native";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useAppSelector } from "@/src/store/redux/store";

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
      <View className="items-center mb-5">
        <StSvg name="Refresh_2" size={48} color={colors.primary.green[500]} />
      </View>

      <Typography weight="semibold" className="text-display text-center mb-3">
        {isBlocking ? "Требуется обновление" : "Доступно обновление"}
      </Typography>

      <Typography className="text-body text-neutral-500 text-center mb-6">
        {isBlocking
          ? "Вышла новая версия Slotter. Для продолжения работы необходимо обновить приложение."
          : "Вышла новая версия Slotter. Рекомендуем обновить приложение для лучшей работы."}
      </Typography>

      <View className="gap-3">
        <Button
          title="Обновить"
          onPress={handleUpdate}
          rightIcon={
            <StSvg name="Upload_fill" size={24} color={colors.neutral[0]} />
          }
        />
        {!isBlocking && (
          <Button
            title="Позже"
            variant="secondary"
            onPress={() => setDismissed(true)}
          />
        )}
      </View>
    </StModal>
  );
};

export default AppUpdateModal;
