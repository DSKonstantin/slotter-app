import React from "react";
import { Pressable } from "react-native";
import { PickedFile, useImagePicker } from "@/src/hooks/useImagePicker";

type ImagePickerTriggerProps = {
  children: React.ReactNode;

  title?: string;
  message?: string;

  options?: {
    aspect?: [number, number];
    quality?: number;
    allowsEditing?: boolean;
  };

  onPick: (asset: PickedFile) => void;
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
