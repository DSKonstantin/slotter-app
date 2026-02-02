import React from "react";
import { View } from "react-native";

import { Button, Typography, StModal } from "@/src/components/ui";

type ImagePickerMenuProps = {
  visible: boolean;
  title?: string;
  message?: string;

  showFiles?: boolean;

  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onFiles?: () => void;
};

export function ImagePickerMenu({
  visible,
  title = "Загрузить фото",
  message = "Выберите источник",
  showFiles = true,
  onClose,
  onCamera,
  onGallery,
  onFiles,
}: ImagePickerMenuProps) {
  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="gap-3 pb-3">
        <Typography weight="semibold" className="text-display text-center">
          {title}
        </Typography>

        {!!message && (
          <Typography className="text-caption text-neutral-500 text-center">
            {message}
          </Typography>
        )}

        <View className="gap-2 mt-2">
          <Button title="📸 Камера" onPress={onCamera} />
          <Button title="🖼 Галерея" onPress={onGallery} />

          {showFiles && onFiles && (
            <Button title="📁 Файлы" onPress={onFiles} />
          )}
        </View>

        <Button title="Отмена" variant="clear" onPress={onClose} />
      </View>
    </StModal>
  );
}
