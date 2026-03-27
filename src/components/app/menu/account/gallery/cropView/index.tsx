import React, { useRef } from "react";
import { View, Image } from "react-native";
import { CropZoom, type CropZoomRefType } from "react-native-zoom-toolkit";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { CropData } from "../types";
import { CropOverlay } from "./CropOverlay";
import { CROP_SIZE } from "./constants";

type CropViewProps = {
  originalUri: string;
  resolution: {
    width: number;
    height: number;
  };
  onDone: (croppedUri: string, cropData: CropData) => void;
  onCancel: () => void;
};

export function CropView({
  originalUri,
  resolution,
  onDone,
  onCancel,
}: CropViewProps) {
  const insets = useSafeAreaInsets();
  const cropRef = useRef<CropZoomRefType>(null);

  const handleCrop = async () => {
    if (!cropRef.current || !resolution) return;

    const cropResult = cropRef.current.crop();
    const imageRef = await ImageManipulator.manipulate(originalUri)
      .crop(cropResult.crop)
      .renderAsync();

    const saved = await imageRef.saveAsync({
      format: SaveFormat.PNG,
    });

    onDone(saved.uri, cropResult.crop);
  };

  return (
    <View className="flex-1 bg-black">
      <View
        className="absolute left-4 right-4 z-10"
        style={{ top: insets.top + 8 }}
      >
        <IconButton
          onPress={onCancel}
          icon={
            <StSvg name="Close_round" size={24} color={colors.neutral[900]} />
          }
        />
      </View>

      <CropZoom
        ref={cropRef}
        cropSize={CROP_SIZE}
        resolution={resolution}
        OverlayComponent={() => <CropOverlay />}
      >
        <Image
          source={{ uri: originalUri }}
          style={{ width: "100%", height: "100%" }}
        />
      </CropZoom>

      <View
        className="absolute left-4 right-4"
        style={{ bottom: insets.bottom + 16 }}
      >
        <Button title="Сохранить" variant="secondary" onPress={handleCrop} />
      </View>
    </View>
  );
}
