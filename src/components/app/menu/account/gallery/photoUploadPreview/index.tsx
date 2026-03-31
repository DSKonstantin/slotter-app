import React, { useState } from "react";
import { FlatList, Image, Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { CropView } from "../cropView";
import type { CropData, PendingPhoto } from "../types";
import { GAP, HORIZONTAL_PADDING, ITEM_HEIGHT, ITEM_WIDTH } from "../constants";

type Props = {
  photos: PendingPhoto[];
  isUploading: boolean;
  onClose: () => void;
  onUpload: (photos: PendingPhoto[]) => void;
};

export function PhotoUploadPreview({
  photos: initialPhotos,
  isUploading,
  onClose,
  onUpload,
}: Props) {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<PendingPhoto[]>(initialPhotos);
  const [cropIndex, setCropIndex] = useState<number | null>(null);

  const handleCropDone = (cropData: CropData) => {
    if (cropIndex === null) return;
    setPhotos((prev) =>
      prev.map((p, i) => (i === cropIndex ? { ...p, cropData } : p)),
    );
    setCropIndex(null);
  };

  const handleRemove = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    if (next.length === 0) {
      onClose();
      return;
    }
    setPhotos(next);
  };

  return (
    <Modal animationType="slide" statusBarTranslucent>
      {cropIndex !== null ? (
        <CropView
          originalUri={photos[cropIndex].uri}
          onDone={handleCropDone}
          onCancel={() => setCropIndex(null)}
        />
      ) : (
        <View
          className="flex-1 bg-background"
          style={{ paddingTop: insets.top }}
        >
          <View className="flex-row items-center justify-between px-screen py-3">
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
            <Typography weight="semibold" className="text-body">
              {photos.length} фото
            </Typography>
            <View className="w-[48px]" />
          </View>

          <FlatList
            data={photos}
            numColumns={2}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{
              paddingHorizontal: HORIZONTAL_PADDING,
              paddingBottom: insets.bottom + 80,
            }}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: ITEM_WIDTH,
                  height: ITEM_HEIGHT,
                  overflow: "hidden",
                  marginBottom: GAP,
                  ...(index % 2 === 0 ? { marginRight: GAP } : {}),
                }}
              >
                <Pressable
                  className="flex-1"
                  onPress={() => setCropIndex(index)}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />

                  {item.cropData && (
                    <View className="absolute top-1.5 left-1.5 bg-primary-blue-500 rounded-full p-1">
                      <StSvg
                        name="Done_round"
                        size={12}
                        color={colors.neutral[0]}
                      />
                    </View>
                  )}

                  <View className="absolute bottom-0 left-0 right-0 bg-black/40 py-1 items-center">
                    <StSvg
                      name="Edit_light"
                      size={16}
                      color={colors.neutral[0]}
                    />
                  </View>
                </Pressable>

                <Pressable
                  className="absolute top-1.5 right-1.5"
                  onPress={() => handleRemove(index)}
                  hitSlop={8}
                >
                  <View className="bg-black/50 rounded-full p-0.5">
                    <StSvg
                      name="Close_round"
                      size={16}
                      color={colors.neutral[0]}
                    />
                  </View>
                </Pressable>
              </View>
            )}
          />

          <View
            className="absolute left-4 right-4"
            style={{ bottom: insets.bottom + 16 }}
          >
            <Button
              title={`Загрузить (${photos.length})`}
              loading={isUploading}
              disabled={isUploading}
              onPress={() => onUpload(photos)}
            />
          </View>
        </View>
      )}
    </Modal>
  );
}
