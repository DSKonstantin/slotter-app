import React, { useState } from "react";
import { Dimensions, Image, Pressable, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { toast } from "@backpackapp-io/react-native-toast";
import * as ImagePicker from "expo-image-picker";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { GalleryViewer } from "./GalleryViewer";
import type { CropData, GalleryPhoto } from "./types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NUM_COLUMNS = 2;
const GAP = 2;
const HORIZONTAL_PADDING = 20;
const MAX_PHOTOS = 20;
const ITEM_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;
const ITEM_HEIGHT = ITEM_WIDTH * (5 / 4);

const Gallery = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const handleAddPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Можно добавить максимум ${MAX_PHOTOS} фото`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) return;

    const availableSlots = MAX_PHOTOS - photos.length;
    const selectedAssets = result.assets.slice(0, availableSlots);

    if (selectedAssets.length < result.assets.length) {
      toast.error(`Можно добавить максимум ${MAX_PHOTOS} фото`);
    }

    const newPhotos: GalleryPhoto[] = selectedAssets.map((asset) => ({
      id: `${Date.now()}_${asset.uri}`,
      originalUri: asset.uri,
      croppedUri: null,
      cropData: null,
      isCover: false,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setViewerIndex(null);
  };

  const handleSetCover = (id: string) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.id === id })));
  };

  const handleCropDone = (
    id: string,
    croppedUri: string,
    cropData: CropData,
  ) => {
    const currentPhoto = photos.find((photo) => photo.id === id);

    // TODO: отправить на бэк { original: originalUri, cropped: croppedUri, crop: cropData }
    console.log("Crop payload:", {
      id,
      originalUri: currentPhoto?.originalUri,
      croppedUri,
      cropData,
    });
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, croppedUri, cropData } : p)),
    );
  };

  return (
    <>
      <ScreenWithToolbar
        title="Галерея"
        rightButton={
          <View className="flex-row gap-1">
            <IconButton
              onPress={handleAddPhoto}
              icon={
                <StSvg name="Add_round" size={24} color={colors.neutral[900]} />
              }
            />
            <IconButton
              onPress={() => {
                /* TODO: edit mode */
              }}
              icon={
                <StSvg name="Edit_fill" size={24} color={colors.neutral[900]} />
              }
            />
          </View>
        }
      >
        {({ topInset }) => (
          <FlashList
            data={photos}
            numColumns={NUM_COLUMNS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingTop: topInset + GAP,
              paddingHorizontal: HORIZONTAL_PADDING,
              paddingBottom: GAP,
            }}
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.column,
                  index % NUM_COLUMNS === 0
                    ? styles.leftColumn
                    : styles.rightColumn,
                ]}
              >
                <Pressable
                  onPress={() => setViewerIndex(index)}
                  style={styles.item}
                >
                  <Image
                    source={{ uri: item.croppedUri ?? item.originalUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {item.isCover && (
                    <View className="absolute top-1.5 left-1.5">
                      <Badge title="Главное фото" variant="accent" size="sm" />
                    </View>
                  )}
                </Pressable>
              </View>
            )}
          />
        )}
      </ScreenWithToolbar>

      {viewerIndex !== null && photos.length > 0 && (
        <GalleryViewer
          photos={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onDelete={handleDelete}
          onSetCover={handleSetCover}
          onCropDone={handleCropDone}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  column: {
    flex: 1,
    marginBottom: GAP,
  },
  leftColumn: {
    paddingRight: GAP / 2,
  },
  rightColumn: {
    paddingLeft: GAP / 2,
  },
  item: {
    width: "100%",
    height: ITEM_HEIGHT,
  },
});

export default Gallery;
