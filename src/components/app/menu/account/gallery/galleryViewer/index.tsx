import React, { useMemo, useState } from "react";
import { Modal } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ImageViewer from "@/src/components/shared/imageViewer";
import { CropView } from "../cropView";
import type { CropData, GalleryPhoto } from "../types";
import { ViewerToolbar } from "./ViewerToolbar";

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
  const [cropVisible, setCropVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const items = useMemo(
    () => photos.map((p) => ({ id: p.id, uri: p.croppedUrl ?? p.photoUrl })),
    [photos],
  );

  const lastIndex = photos.length - 1;
  const safeIndex =
    lastIndex >= 0 ? Math.min(Math.max(currentIndex, 0), lastIndex) : -1;
  const current = safeIndex >= 0 ? photos[safeIndex] : null;

  if (cropVisible && current) {
    return (
      <Modal
        visible
        animationType="fade"
        statusBarTranslucent
        transparent
        presentationStyle="overFullScreen"
      >
        <GestureHandlerRootView className="flex-1">
          <CropView
            originalUri={current.originalUrl}
            onDone={(cropData) => {
              setCropVisible(false);
              onCropDone(current.id, cropData);
            }}
            onCancel={() => setCropVisible(false)}
          />
        </GestureHandlerRootView>
      </Modal>
    );
  }

  return (
    <ImageViewer
      images={items}
      initialIndex={initialIndex}
      onClose={onClose}
      onIndexChange={setCurrentIndex}
      renderFooter={() =>
        current ? (
          <ViewerToolbar
            onSetCover={() => {
              onSetCover(current.id);
              onClose();
            }}
            onEdit={() => setCropVisible(true)}
            onDelete={() => onDelete(current.id)}
          />
        ) : null
      }
    />
  );
}
