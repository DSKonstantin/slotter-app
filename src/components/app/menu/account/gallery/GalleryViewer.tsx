import React, { useState } from "react";
import { View, Modal, Dimensions, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gallery } from "react-native-zoom-toolkit";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { CropView } from "./CropView";
import type { CropData, GalleryPhoto } from "./types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type GalleryViewerProps = {
  photos: GalleryPhoto[];
  initialIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSetCover: (id: string) => void;
  onCropDone: (id: string, croppedUri: string, cropData: CropData) => void;
};

export function GalleryViewer({
  photos,
  initialIndex,
  onClose,
  onDelete,
  onSetCover,
  onCropDone,
}: GalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [cropVisible, setCropVisible] = useState(false);

  const current = photos[currentIndex];

  const renderItem = (item: GalleryPhoto) => (
    <Image
      source={{ uri: item.croppedUri ?? item.originalUri }}
      style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      resizeMode="contain"
    />
  );

  const handleCropDone = (croppedUri: string, cropData: CropData) => {
    setCropVisible(false);
    onCropDone(current.id, croppedUri, cropData);
  };

  return (
    <Modal
      visible
      animationType="fade"
      statusBarTranslucent
      transparent
      presentationStyle="overFullScreen"
    >
      <GestureHandlerRootView className="flex-1">
        {cropVisible ? (
          <CropView
            originalUri={current.originalUri}
            onDone={handleCropDone}
            onCancel={() => setCropVisible(false)}
          />
        ) : (
          <View className="flex-1 bg-black">
            {/* Header */}
            <View className="absolute top-[52px] left-4 right-4 z-10 flex-row items-center justify-between">
              <IconButton
                onPress={onClose}
                icon={
                  <StSvg
                    name="Close_round"
                    size={24}
                    color={colors.neutral[900]}
                  />
                }
              />
              <Typography className="text-neutral-0 text-body">
                {currentIndex + 1} из {photos.length}
              </Typography>
              <View className="w-10" />
            </View>

            {/* Gallery */}
            <Gallery
              data={photos}
              keyExtractor={(item) => item.id}
              initialIndex={initialIndex}
              renderItem={(item) => renderItem(item)}
              onIndexChange={setCurrentIndex}
            />

            {/* Footer actions */}
            <View className="absolute bottom-10 left-4 right-4 flex-row justify-around">
              <View className="items-center gap-1">
                <IconButton
                  icon={
                    <StSvg
                      name="Img_box_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  onPress={() => onSetCover(current.id)}
                />
                <Typography className="text-neutral-0 text-xs">
                  Сделать обложкой
                </Typography>
              </View>
              <View className="items-center gap-1">
                <IconButton
                  icon={
                    <StSvg
                      name="Edit_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  onPress={() => setCropVisible(true)}
                />
                <Typography className="text-neutral-0 text-xs">
                  Редактировать
                </Typography>
              </View>
              <View className="items-center gap-1">
                <IconButton
                  icon={
                    <StSvg
                      name="Trash"
                      size={24}
                      color={colors.accent.red[500]}
                    />
                  }
                  onPress={() => onDelete(current.id)}
                />
                <Typography className="text-accent-red-500 text-xs">
                  Удалить
                </Typography>
              </View>
            </View>
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}
