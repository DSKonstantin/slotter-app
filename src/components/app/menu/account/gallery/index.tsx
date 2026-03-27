import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { toast } from "@backpackapp-io/react-native-toast";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useImagePicker } from "@/src/hooks/useImagePicker";
import { Badge, Button, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { GalleryViewer } from "./galleryViewer";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { pickFromGallery } = useImagePicker();

  const toggleEditMode = () => {
    setIsEditMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Можно добавить максимум ${MAX_PHOTOS} фото`);
      return;
    }

    const assets = await pickFromGallery({
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!assets) return;

    const availableSlots = MAX_PHOTOS - photos.length;
    const selectedAssets = assets.slice(0, availableSlots);

    if (selectedAssets.length < assets.length) {
      toast.error(`Можно добавить максимум ${MAX_PHOTOS} фото`);
    }

    const newPhotos: GalleryPhoto[] = selectedAssets.map((asset) => ({
      id: `${Date.now()}_${asset.uri}`,
      originalUri: asset.uri,
      width: asset.width,
      height: asset.height,
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

  const handleDeleteSelected = () => {
    Alert.alert(
      `Удалить ${selectedIds.size} фото?`,
      "Это действие нельзя отменить",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            setPhotos((prev) => prev.filter((p) => !selectedIds.has(p.id)));
            setSelectedIds(new Set());
            setIsEditMode(false);
          },
        },
      ],
    );
  };

  const handleSetCover = (id: string) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.id === id })));
  };

  const handleCropDone = (
    id: string,
    croppedUri: string,
    cropData: CropData,
  ) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, croppedUri, cropData } : p)),
    );
  };

  return (
    <>
      <ScreenWithToolbar
        title="Галерея"
        rightButton={
          <View className="items-end w-[48px] h-[48px]">
            <View className="absolute right-0 flex-row bg-background-surface h-[48px] items-center rounded-full">
              <IconButton
                onPress={handleAddPhoto}
                icon={
                  <StSvg
                    name="Add_round"
                    size={28}
                    color={colors.neutral[900]}
                  />
                }
              />
              <IconButton
                onPress={toggleEditMode}
                icon={
                  <StSvg
                    name="Edit_fill"
                    size={28}
                    color={
                      isEditMode
                        ? colors.primary.blue[500]
                        : colors.neutral[900]
                    }
                  />
                }
              />
            </View>
          </View>
        }
      >
        {({ topInset, bottomInset }) => (
          <View className="flex-1">
            <FlashList
              data={photos}
              numColumns={NUM_COLUMNS}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingTop: topInset,
                paddingHorizontal: HORIZONTAL_PADDING,
                paddingBottom: bottomInset + (isEditMode ? 80 : 16),
              }}
              renderItem={({ item, index }) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <View style={styles.column}>
                    <Pressable
                      onPress={() =>
                        isEditMode
                          ? toggleSelect(item.id)
                          : setViewerIndex(index)
                      }
                      style={styles.item}
                    >
                      <Image
                        source={{ uri: item.croppedUri ?? item.originalUri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {item.isCover && !isEditMode && (
                        <View className="absolute top-1.5 left-1.5">
                          <Badge
                            title="Главное фото"
                            variant="accent"
                            size="sm"
                          />
                        </View>
                      )}
                      {isEditMode && (
                        <View
                          className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full border-2 items-center justify-center ${
                            isSelected
                              ? "bg-primary-blue-500 border-primary-blue-500"
                              : "bg-neutral-900/30 border-neutral-0"
                          }`}
                        >
                          {isSelected && (
                            <StSvg
                              name="Done_round"
                              size={14}
                              color={colors.neutral[0]}
                            />
                          )}
                        </View>
                      )}
                      {isEditMode && isSelected && (
                        <View className="absolute inset-0 bg-primary-blue-500/20" />
                      )}
                    </Pressable>
                  </View>
                );
              }}
            />

            {isEditMode && selectedIds.size > 0 && (
              <View
                className="absolute left-4 right-4"
                style={{ bottom: bottomInset + 16 }}
              >
                <Button
                  title={`Удалить (${selectedIds.size})`}
                  variant="destructive"
                  onPress={handleDeleteSelected}
                />
              </View>
            )}
          </View>
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
    paddingHorizontal: GAP / 2,
  },
  item: {
    width: "100%",
    height: ITEM_HEIGHT,
  },
});

export default Gallery;
