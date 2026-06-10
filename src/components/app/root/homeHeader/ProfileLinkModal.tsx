import React, { useCallback, useState } from "react";

import { Pressable, Share, View } from "react-native";
import ComingSoonModal from "@/src/components/shared/modals/ComingSoonModal";

import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";

import { toast } from "@backpackapp-io/react-native-toast";

import { Button, StModal, StSvg, Typography } from "@/src/components/ui";

import { colors } from "@/src/styles/colors";

type ProfileActionsModalProps = {
  visible: boolean;

  onClose: () => void;

  profileUrl?: string | null;

  profileLink?: string | null;
};

const ProfileLinkModal = ({
  visible,
  onClose,
  profileUrl,
  profileLink,
}: ProfileActionsModalProps) => {
  const [comingSoonVisible, setComingSoonVisible] = useState(false);
  const hasProfile = Boolean(profileUrl);

  const handleOpen = useCallback(async () => {
    if (!profileUrl) {
      return;
    }

    await WebBrowser.openBrowserAsync(profileUrl);

    onClose();
  }, [profileUrl, onClose]);

  const handleCopy = useCallback(async () => {
    if (!profileLink) {
      return;
    }

    await Clipboard.setStringAsync(profileLink);

    toast.success("Ссылка скопирована");

    onClose();
  }, [profileLink, onClose]);

  const handleShare = useCallback(async () => {
    onClose();
  }, [onClose]);

  return (
    <StModal visible={visible} onClose={onClose}>
      <Typography weight="semibold" className="text-display text-center mb-4">
        Поделиться?
      </Typography>

      <View className="gap-2">
        <Button
          variant="secondary"
          title="Перейти на свою страницу"
          onPress={handleOpen}
          disabled={!hasProfile}
        />

        <Button
          variant="secondary"
          title="Скопировать ссылку"
          onPress={handleCopy}
          disabled={!hasProfile}
        />

        <Button
          variant="secondary"
          buttonClassName="opacity-40"
          title="Поделиться слотами"
          onPress={() => setComingSoonVisible(true)}
        />
      </View>
      <ComingSoonModal
        visible={comingSoonVisible}
        onClose={() => setComingSoonVisible(false)}
      />
    </StModal>
  );
};

export default ProfileLinkModal;
