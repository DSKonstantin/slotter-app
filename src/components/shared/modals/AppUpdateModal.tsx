import React, { useState } from "react";
import { Linking } from "react-native";
import { Image } from "expo-image";
import { Badge, Button, StModal, Typography } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/redux/store";

const DESCRIPTION =
  "Приложение стало еще лучше, нам важно, чтобы вы обновили его";

const UPDATE_BUTTON_GLOW = [
  "0px 2px 5px 0px #D6FFA31F",
  "0px 9px 9px 0px #D6FFA31A",
  "0px 19px 12px 0px #D6FFA30F",
  "0px 35px 14px 0px #D6FFA305",
  "0px 54px 15px 0px #D6FFA300",
].join(", ");

const AppUpdateModal: React.FC = () => {
  const { updateStatus, storeUrl } = useAppSelector((s) => s.appVersion);
  const [dismissed, setDismissed] = useState(false);

  const isForced = updateStatus === "red";
  const visible =
    (updateStatus === "red" || updateStatus === "yellow") &&
    (isForced || !dismissed);

  const handleUpdate = () => {
    if (storeUrl) {
      void Linking.openURL(storeUrl);
    }
  };

  return (
    <StModal
      visible={visible}
      onClose={() => setDismissed(true)}
      dismissible={!isForced}
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

      <Typography weight="semibold" className="text-display mt-5 mb-2">
        Обновили приложение
      </Typography>

      <Typography weight="regular" className="text-body mb-6">
        {DESCRIPTION}
      </Typography>

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
        buttonProps={{
          style: { boxShadow: UPDATE_BUTTON_GLOW },
        }}
      />
    </StModal>
  );
};

export default AppUpdateModal;
