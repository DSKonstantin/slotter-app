import React, { useRef } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { CropZoom, type CropZoomRefType } from "react-native-zoom-toolkit";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { CropData } from "../types";
import { CropOverlay } from "./CropOverlay";
import { CROP_SIZE } from "./constants";
import { useResolution } from "./useResolution";

type CropViewProps = {
  originalUri: string;
  isSaving?: boolean;
  onDone: (cropData: CropData) => void;
  onCancel: () => void;
};

export function CropView({
  originalUri,
  isSaving,
  onDone,
  onCancel,
}: CropViewProps) {
  const insets = useSafeAreaInsets();
  const cropRef = useRef<CropZoomRefType>(null);
  const { resolution, isLoading } = useResolution(originalUri);

  const handleCrop = () => {
    if (!cropRef.current) return;
    const { crop } = cropRef.current.crop();
    onDone({
      originX: crop.originX,
      originY: crop.originY,
      width: crop.width,
      height: crop.height,
    });
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

      {isLoading || !resolution ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.neutral[0]} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
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
        </View>
      )}

      <View
        className="absolute left-4 right-4"
        style={{ bottom: insets.bottom + 16 }}
      >
        <Button
          title="Сохранить"
          variant="secondary"
          onPress={handleCrop}
          disabled={isSaving}
          loading={isSaving}
        />
      </View>
    </View>
  );
}
