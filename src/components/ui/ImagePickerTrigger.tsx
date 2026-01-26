import React from "react";
import { Pressable, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useImagePicker } from "@/src/hooks/useImagePicker";

type ImagePickerTriggerProps = {
  children: React.ReactNode;

  title?: string;
  message?: string;

  options?: {
    aspect?: [number, number];
    quality?: number;
    allowsEditing?: boolean;
  };

  onPick: (asset: ImagePicker.ImagePickerAsset) => void;
};

export function ImagePickerTrigger({
  children,
  onPick,
  title,
  message,
  options,
}: ImagePickerTriggerProps) {
  const { openPickerMenu } = useImagePicker();

  const handlePress = () => {
    openPickerMenu({
      title,
      message,
      options,
      onPick,
    });
  };

  return <Pressable onPress={handlePress}>{children}</Pressable>;
}
