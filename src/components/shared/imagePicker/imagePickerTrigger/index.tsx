import React, { useCallback, useState } from "react";
import { Pressable } from "react-native";
import type { ImagePickerAsset, ImagePickerOptions } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import ImagePickerMenu from "@/src/components/shared/imagePicker/imagePickerMenu";
import { useImagePicker } from "@/src/hooks/useImagePicker";

type PickedAssets = ImagePickerAsset[] | DocumentPickerAsset[];

type ImagePickerTriggerProps = {
  children: React.ReactNode;

  title?: string;
  message?: string;

  options?: ImagePickerOptions;
  includeFiles?: boolean;

  disabled?: boolean;

  onPick: (assets: PickedAssets) => void;
};

const ImagePickerTrigger = ({
  children,
  title,
  message,
  options,
  includeFiles,
  disabled,
  onPick,
}: ImagePickerTriggerProps) => {
  const { pickFromCamera, pickFromGallery, pickFromFiles } = useImagePicker();
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => setVisible(false), []);

  const open = useCallback(() => {
    if (disabled) return;
    setVisible(true);
  }, [disabled]);

  const handlePick = useCallback(
    async (
      pick: (
        opts?: ImagePickerOptions,
      ) => Promise<ImagePickerAsset[] | DocumentPickerAsset[] | null>,
    ) => {
      try {
        const assets = await pick(options);
        if (assets?.length) {
          onPick(assets);
        }
      } finally {
        close();
      }
    },
    [close, onPick, options],
  );

  const handleCamera = useCallback(
    () => handlePick(pickFromCamera),
    [handlePick, pickFromCamera],
  );
  const handleGallery = useCallback(
    () => handlePick(pickFromGallery),
    [handlePick, pickFromGallery],
  );
  const handleFiles = useCallback(
    () => handlePick(pickFromFiles),
    [handlePick, pickFromFiles],
  );

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
        onCamera={handleCamera}
        onGallery={handleGallery}
        onFiles={handleFiles}
      />
    </>
  );
};

export default ImagePickerTrigger;
