import React, { useCallback, useState } from "react";
import { Pressable } from "react-native";
import type { ImagePickerAsset, ImagePickerOptions } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import ImagePickerMenu from "@/src/components/shared/imagePicker/imagePickerMenu";
import { useImagePicker } from "@/src/hooks/useImagePicker";

export type PickedAssets = ImagePickerAsset[] | DocumentPickerAsset[];

type Props = {
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
}: Props) => {
  const { pickFromCamera, pickFromGallery, pickFromFiles } = useImagePicker();
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => {
    if (!disabled) setVisible(true);
  }, [disabled]);

  const close = useCallback(() => setVisible(false), []);

  const handleCamera = useCallback(async () => {
    try {
      const assets = await pickFromCamera(options);
      if (assets?.length) onPick(assets);
    } catch (e) {
      console.warn("Camera pick failed", e);
    } finally {
      close();
    }
  }, [pickFromCamera, options, onPick, close]);

  const handleGallery = useCallback(async () => {
    try {
      const assets = await pickFromGallery(options);
      if (assets?.length) onPick(assets);
    } catch (e) {
      console.warn("Gallery pick failed", e);
    } finally {
      close();
    }
  }, [pickFromGallery, options, onPick, close]);

  const handleFiles = useCallback(async () => {
    try {
      const assets = await pickFromFiles(options);
      if (assets?.length) onPick(assets);
    } catch (e) {
      console.warn("File pick failed", e);
    } finally {
      close();
    }
  }, [pickFromFiles, options, onPick, close]);

  return (
    <>
      <Pressable
        onPress={open}
        disabled={disabled}
        className="active:opacity-70"
      >
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
