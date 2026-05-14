import React, { useCallback, useMemo, useState } from "react";
import { Modal, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gallery } from "react-native-zoom-toolkit";
import { scheduleOnRN } from "react-native-worklets";
import ZoomableImage from "@/src/components/shared/imageViewer/ZoomableImage";
import ImageViewerHeader from "@/src/components/shared/imageViewer/ImageViewerHeader";
import { CropView } from "../cropView";
import type { CropData, GalleryPhoto } from "../types";
import { ViewerToolbar } from "./ViewerToolbar";

type GalleryViewerProps = {
  photos: GalleryPhoto[];
  initialIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSetCover: (id: string) => void;
  onCropDone: (id: string, cropData: CropData) => Promise<void>;
};

type ImageItem = { id: string; uri: string };

export function GalleryViewer({
  photos,
  initialIndex,
  onClose,
  onDelete,
  onSetCover,
  onCropDone,
}: GalleryViewerProps) {
  const [cropVisible, setCropVisible] = useState(false);
  const [cropSaving, setCropSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const items = useMemo<ImageItem[]>(
    () => photos.map((p) => ({ id: p.id, uri: p.croppedUrl ?? p.photoUrl })),
    [photos],
  );

  const lastIndex = photos.length - 1;
  const safeIndex =
    lastIndex >= 0 ? Math.min(Math.max(currentIndex, 0), lastIndex) : -1;
  const current = safeIndex >= 0 ? photos[safeIndex] : null;

  const keyExtractor = useCallback((item: ImageItem) => item.id, []);
  const renderItem = useCallback(
    (item: ImageItem) => <ZoomableImage uri={item.uri} />,
    [],
  );

  const handleCropDone = useCallback(
    async (cropData: CropData) => {
      if (!current) return;
      setCropSaving(true);
      try {
        await onCropDone(current.id, cropData);
        setCropVisible(false);
      } finally {
        setCropSaving(false);
      }
    },
    [current, onCropDone],
  );

  return (
    <Modal
      visible
      animationType="fade"
      statusBarTranslucent
      transparent
      presentationStyle="overFullScreen"
    >
      <GestureHandlerRootView className="flex-1">
        {cropVisible && current ? (
          <CropView
            originalUri={current.originalUrl}
            isSaving={cropSaving}
            onDone={handleCropDone}
            onCancel={() => setCropVisible(false)}
          />
        ) : (
          <View className="flex-1 bg-black">
            <ImageViewerHeader
              currentIndex={safeIndex}
              total={photos.length}
              onClose={onClose}
            />
            <Gallery
              key={items[safeIndex]?.uri}
              data={items}
              keyExtractor={keyExtractor}
              initialIndex={safeIndex}
              onVerticalPull={(translateY, released) => {
                "worklet";
                if (released && Math.abs(translateY) > 120) {
                  scheduleOnRN(onClose);
                }
              }}
              allowPinchPanning
              renderItem={renderItem}
              onIndexChange={setCurrentIndex}
            />
            {current && (
              <ViewerToolbar
                onSetCover={() => {
                  onSetCover(current.id);
                  onClose();
                }}
                onEdit={() => setCropVisible(true)}
                onDelete={() => onDelete(current.id)}
              />
            )}
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}
