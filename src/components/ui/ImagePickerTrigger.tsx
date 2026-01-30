import React, { useCallback, useMemo, useState } from "react";
import { Pressable } from "react-native";
import type { ImagePickerAsset, ImagePickerOptions } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import { ImagePickerMenu } from "@/src/components/auth/service/ImagePickerMenu";
import { useImagePicker } from "@/src/hooks/useImagePicker";

type ImagePickerTriggerProps = {
  children: React.ReactNode;

  title?: string;
  message?: string;

  options?: ImagePickerOptions;
  includeFiles?: boolean;

  disabled?: boolean;

  onPick: (assets: ImagePickerAsset[] | DocumentPickerAsset[]) => void;
};

export function ImagePickerTrigger({
  children,
  title,
  message,
  options,
  includeFiles,
  disabled,
  onPick,
}: ImagePickerTriggerProps) {
  const { pickFromCamera, pickFromGallery, pickFromFiles } = useImagePicker();
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => setVisible(false), []);

  const open = useCallback(() => {
    if (disabled) return;
    setVisible(true);
  }, [disabled]);

  return (
    <>
      <Pressable disabled={disabled} onPress={open}>
        {children}
      </Pressable>

      <ImagePickerMenu
        visible={visible}
        title={title}
        message={message}
        showFiles={includeFiles}
        onClose={close}
        onCamera={async () => {
          const assets = await pickFromCamera(options);
          if (assets) onPick(assets);
          close();
        }}
        onGallery={async () => {
          const assets = await pickFromGallery(options);
          if (assets) onPick(assets);
          close();
        }}
        onFiles={async () => {
          const assets = await pickFromFiles(options);
          if (assets) onPick(assets);
          close();
        }}
      />
    </>
  );
}
