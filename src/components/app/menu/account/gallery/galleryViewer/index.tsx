import React, { useCallback, useEffect, useState } from "react";
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
  onCropDone: (id: string, cropData: CropData) => void;
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

  const lastPhotoIndex = photos.length - 1;
  const safeCurrentIndex =
    lastPhotoIndex >= 0
      ? Math.min(Math.max(currentIndex, 0), lastPhotoIndex)
      : -1;
  const current = safeCurrentIndex >= 0 ? photos[safeCurrentIndex] : null;

  useEffect(() => {
    if (photos.length === 0) {
      onClose();
      return;
    }

    if (safeCurrentIndex !== currentIndex) {
      setCurrentIndex(safeCurrentIndex);
    }
  }, [currentIndex, onClose, photos.length, safeCurrentIndex]);

  const handleCropDone = (cropData: CropData) => {
    setCropVisible(false);
    if (!current) return;
    onCropDone(current.id, cropData);
  };

  const renderItem = useCallback(
    (item: GalleryPhoto, index: number) => (
      <GalleryImage uri={item.croppedUrl ?? item.photoUrl} index={index} />
    ),
    [],
  );

  if (!current) return null;

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
            originalUri={current.originalUrl}
            onDone={handleCropDone}
            onCancel={() => setCropVisible(false)}
          />
        ) : (
          <View className="flex-1 bg-black">
            <ViewerHeader
              currentIndex={safeCurrentIndex}
              total={photos.length}
              topInset={insets.top}
              onClose={onClose}
            />

            <Gallery
              data={photos}
              keyExtractor={(item) => item.id}
              initialIndex={safeCurrentIndex}
              renderItem={renderItem}
              onIndexChange={setCurrentIndex}
            />

            <ViewerToolbar
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
