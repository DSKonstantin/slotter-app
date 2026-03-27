import React, { useCallback, useState } from "react";
import { View, Modal } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gallery } from "react-native-zoom-toolkit";
import { CropView } from "../cropView";
import type { CropData, GalleryPhoto } from "../types";
import { ViewerHeader } from "./ViewerHeader";
import { ViewerToolbar } from "./ViewerToolbar";
import GalleryImage from "@/src/components/app/menu/account/gallery/galleryViewer/GalleryImage";

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
  const insets = useSafeAreaInsets();

  const current = photos[currentIndex];

  const handleCropDone = (croppedUri: string, cropData: CropData) => {
    setCropVisible(false);
    onCropDone(current.id, croppedUri, cropData);
  };

  const renderItem = useCallback((item: GalleryPhoto, index: number) => {
    return (
      <GalleryImage uri={item.croppedUri ?? item.originalUri} index={index} />
    );
  }, []);

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
            resolution={{ width: current.width, height: current.height }}
            onDone={handleCropDone}
            onCancel={() => setCropVisible(false)}
          />
        ) : (
          <View className="flex-1 bg-black">
            <ViewerHeader
              currentIndex={currentIndex}
              total={photos.length}
              topInset={insets.top}
              onClose={onClose}
            />

            <Gallery
              data={photos}
              keyExtractor={(item) => item.id}
              initialIndex={currentIndex}
              renderItem={renderItem}
              onIndexChange={setCurrentIndex}
            />

            <ViewerToolbar
              bottomInset={insets.bottom}
              onSetCover={() => {
                onSetCover(current.id);
                onClose();
              }}
              onEdit={() => setCropVisible(true)}
              onDelete={() => onDelete(current.id)}
            />
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}
