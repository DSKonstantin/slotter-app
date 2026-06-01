import React, { useCallback, useState } from "react";
import { Pressable } from "react-native";
import type { ImagePickerAsset, ImagePickerOptions } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import ImagePickerMenu from "@/src/components/shared/imagePicker/imagePickerMenu";
import { useImagePicker } from "@/src/hooks/useImagePicker";
import { useModalAction } from "@/src/hooks/useModalAction";

export type PickedAssets = ImagePickerAsset[] | DocumentPickerAsset[];

type Props = {
  children: React.ReactNode;
  title?: string;
  options?: ImagePickerOptions;
  includeFiles?: boolean;
  disabled?: boolean;
  onPick: (assets: PickedAssets) => void;
};

const ImagePickerTrigger = ({
  children,
  title,
  options,
  includeFiles,
  disabled,
  onPick,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const { pickFromCamera, pickFromGallery, pickFromFiles } = useImagePicker();

  const close = useCallback(() => setVisible(false), []);
  const { scheduleAction, onModalHide } = useModalAction(close);

  const open = useCallback(() => {
    if (!disabled) setVisible(true);
  }, [disabled]);

  const handleCamera = useCallback(() => {
    scheduleAction(async () => {
      try {
        const assets = await pickFromCamera(options);
        if (assets?.length) onPick(assets);
      } catch (e) {
        console.warn("Camera pick failed", e);
      }
    });
  }, [scheduleAction, pickFromCamera, options, onPick]);

  const handleGallery = useCallback(() => {
    scheduleAction(async () => {
      try {
        const assets = await pickFromGallery(options);
        if (assets?.length) onPick(assets);
      } catch (e) {
        console.warn("Gallery pick failed", e);
      }
    });
  }, [scheduleAction, pickFromGallery, options, onPick]);

  const handleFiles = useCallback(() => {
    scheduleAction(async () => {
      try {
        const assets = await pickFromFiles(options);
        if (assets?.length) onPick(assets);
      } catch (e) {
        console.warn("File pick failed", e);
      }
    });
  }, [scheduleAction, pickFromFiles, options, onPick]);

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
        showFiles={includeFiles}
        onClose={close}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onFiles={handleFiles}
        onModalHide={onModalHide}
      />
    </>
  );
};

export default ImagePickerTrigger;
