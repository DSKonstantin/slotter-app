import React, { useCallback, useEffect, useState } from "react";
import { Modal, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gallery } from "react-native-zoom-toolkit";
import ZoomableImage from "./ZoomableImage";
import ImageViewerHeader from "./ImageViewerHeader";

export type ImageItem = { id: string; uri: string };

export type ImageViewerSlotContext = {
  currentIndex: number;
  total: number;
  current: ImageItem;
  close: () => void;
};

type SlotRenderer = (ctx: ImageViewerSlotContext) => React.ReactNode;

type Props = {
  images: ImageItem[];
  initialIndex: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  renderHeader?: SlotRenderer;
  renderFooter?: SlotRenderer;
};

const ImageViewer = ({
  images,
  initialIndex,
  onClose,
  onIndexChange,
  renderHeader,
  renderFooter,
}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const lastIndex = images.length - 1;
  const safeIndex =
    lastIndex >= 0 ? Math.min(Math.max(currentIndex, 0), lastIndex) : -1;
  const current = safeIndex >= 0 ? images[safeIndex] : null;

  // Auto-close when the source set empties; clamp the index when it shrinks.
  useEffect(() => {
    if (images.length === 0) {
      onClose();
      return;
    }
    if (safeIndex !== currentIndex) {
      setCurrentIndex(safeIndex);
      onIndexChange?.(safeIndex);
    }
  }, [currentIndex, images.length, onClose, onIndexChange, safeIndex]);

  const handleIndexChange = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      onIndexChange?.(index);
    },
    [onIndexChange],
  );

  const renderItem = useCallback(
    (item: ImageItem) => <ZoomableImage uri={item.uri} />,
    [],
  );

  if (!current) return null;

  const ctx: ImageViewerSlotContext = {
    currentIndex: safeIndex,
    total: images.length,
    current,
    close: onClose,
  };

  const headerNode = renderHeader ? (
    renderHeader(ctx)
  ) : (
    <ImageViewerHeader
      currentIndex={ctx.currentIndex}
      total={ctx.total}
      onClose={onClose}
    />
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
        <View className="flex-1 bg-black">
          {headerNode}
          <Gallery
            data={images}
            keyExtractor={(item) => item.id}
            initialIndex={safeIndex}
            renderItem={renderItem}
            onIndexChange={handleIndexChange}
          />
          {renderFooter?.(ctx)}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default ImageViewer;
