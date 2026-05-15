import React, { useRef } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { CropZoom, type CropZoomRefType } from "react-native-zoom-toolkit";
import { Button, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { TopGradientBar } from "@/src/components/shared/imageViewer/TopGradientBar";
import { BottomGradientBar } from "@/src/components/shared/imageViewer/BottomGradientBar";
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
      <TopGradientBar>
        <IconButton
          onPress={onCancel}
          icon={
            <StSvg name="Close_round" size={24} color={colors.neutral[900]} />
          }
        />
      </TopGradientBar>

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

      <BottomGradientBar>
        <Button
          title="Сохранить"
          variant="secondary"
          onPress={handleCrop}
          disabled={isSaving}
          loading={isSaving}
        />
      </BottomGradientBar>
    </View>
  );
}
