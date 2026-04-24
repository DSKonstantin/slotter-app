import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { toast } from "@backpackapp-io/react-native-toast";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useImagePicker } from "@/src/hooks/useImagePicker";
import {
  Badge,
  Button,
  FloatingFooter,
  IconButton,
  StImage,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { GalleryViewer } from "./galleryViewer";
import { PhotoUploadPreview } from "./photoUploadPreview";
import type { CropData, GalleryPhoto, PendingPhoto } from "./types";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import {
  useBulkCreateGalleryPhotosMutation,
  useGetGalleryPhotosQuery,
  useUpdateGalleryPhotoMutation,
  useDeleteGalleryPhotoMutation,
  useReorderGalleryPhotosMutation,
} from "@/src/store/redux/services/api/galleryApi";
import type { GalleryPhoto as ApiGalleryPhoto } from "@/src/store/redux/services/api-types";
import {
  GAP,
  HORIZONTAL_PADDING,
  ITEM_HEIGHT,
  ITEM_WIDTH,
  MAX_PHOTOS,
} from "./constants";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";

const toUiPhoto = (p: ApiGalleryPhoto): GalleryPhoto => ({
  id: String(p.id),
  originalUrl: p.original_photo_url,
  photoUrl: p.photo_url,
  croppedUrl: p.cropped_photo_url ?? null,
  thumbnailUrl: p.cropped_photo_url ?? p.thumbnail_photo_url,
  cropData: p.crop_data
    ? {
        originX: p.crop_data.x,
        originY: p.crop_data.y,
        width: p.crop_data.width,
        height: p.crop_data.height,
      }
    : null,
  isCover: false,
});

const EMPTY_GALLERY_PHOTOS: ApiGalleryPhoto[] = [];

const Gallery = () => {
  const auth = useRequiredAuth();
  const { userId } = auth!;
  const { pickFromGallery } = useImagePicker();

  const {
    data: galleryResponse,
    isLoading: isGalleryLoading,
    isError: isGalleryError,
    refetch,
  } = useGetGalleryPhotosQuery(auth ? { userId: auth.userId } : skipToken, {
    refetchOnMountOrArgChange: true,
  });

  const { refreshing, onRefresh } = useRefresh(refetch);

  const [bulkCreateGalleryPhotos, { isLoading: isUploading }] =
    useBulkCreateGalleryPhotosMutation();
  const [updateGalleryPhoto] = useUpdateGalleryPhotoMutation();
  const [deleteGalleryPhoto] = useDeleteGalleryPhotoMutation();
  const [reorderGalleryPhotos] = useReorderGalleryPhotosMutation();

  const photos = useMemo(
    () =>
      (galleryResponse?.gallery_photos ?? EMPTY_GALLERY_PHOTOS).map(toUiPhoto),
    [galleryResponse?.gallery_photos],
  );

  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[] | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewerPhotoId, setViewerPhotoId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null);
  const isEditMode = selectedIds !== null;
  const viewerIndex =
    viewerPhotoId !== null
      ? photos.findIndex((p) => p.id === viewerPhotoId)
      : -1;

  const toggleEditMode = () => {
    setSelectedIds((prev) => (prev === null ? new Set() : null));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev === null) return prev;
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

    if (!selectedAssets.length) return;

    setPendingPhotos(
      selectedAssets.map((asset, index) => ({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileName:
          asset.fileName ?? `gallery-photo-${photos.length + index + 1}.jpg`,
        cropData: null,
        croppedUri: null,
      })),
    );
  };

  const handleUploadAll = async (pending: PendingPhoto[]) => {
    const formData = new FormData();

    pending.forEach((photo) => {
      formData.append("gallery_photos[][photo]", {
        uri: photo.uri,
        type: photo.mimeType,
        name: photo.fileName,
      } as never);

      if (photo.cropData) {
        formData.append(
          "gallery_photos[][crop_data][x]",
          String(photo.cropData.originX),
        );
        formData.append(
          "gallery_photos[][crop_data][y]",
          String(photo.cropData.originY),
        );
        formData.append(
          "gallery_photos[][crop_data][width]",
          String(photo.cropData.width),
        );
        formData.append(
          "gallery_photos[][crop_data][height]",
          String(photo.cropData.height),
        );
      }
    });

    try {
      await bulkCreateGalleryPhotos({ userId, data: formData }).unwrap();
      setPendingPhotos(null);
      setUploadError(null);
    } catch (error) {
      setUploadError(getApiErrorMessage(error, "Не удалось загрузить фото"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGalleryPhoto({ userId, id: parseInt(id, 10) || 0 }).unwrap();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось удалить фото"));
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedIds?.size) return;
    const toDelete = [...selectedIds];
    Alert.alert(
      `Удалить ${selectedIds.size} фото?`,
      "Это действие нельзя отменить",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            setSelectedIds(null);
            for (const id of toDelete) {
              try {
                await deleteGalleryPhoto({
                  userId,
                  id: parseInt(id, 10) || 0,
                }).unwrap();
              } catch (error) {
                toast.error(
                  getApiErrorMessage(error, "Не удалось удалить фото"),
                );
                return;
              }
            }
          },
        },
      ],
    );
  };

  const handleSetCover = async (id: string) => {
    const positions = [
      { id: parseInt(id, 10) || 0, position: 0 },
      ...photos
        .filter((p) => p.id !== id)
        .map((p, index) => ({ id: Number(p.id), position: index + 1 })),
    ];
    try {
      await reorderGalleryPhotos({ userId, positions }).unwrap();
      toast.success("Обложка обновлена");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось обновить обложку"));
    }
  };

  const handleCropDone = async (id: string, cropData: CropData) => {
    try {
      await updateGalleryPhoto({
        userId,
        id: parseInt(id, 10) || 0,
        data: {
          crop_data: {
            x: cropData.originX,
            y: cropData.originY,
            width: cropData.width,
            height: cropData.height,
          },
        },
      }).unwrap();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Не удалось сохранить кадрирование"),
      );
    }
  };

  const renderItem: ListRenderItem<GalleryPhoto> = ({ item, index }) => {
    const isSelected = selectedIds?.has(item.id) ?? false;

    return (
      <View style={[styles.item, index % 2 === 0 && styles.itemLeftColumn]}>
        <Pressable
          className="active:opacity-70"
          onPress={() => {
            if (isEditMode) {
              toggleSelect(item.id);
            } else {
              setViewerPhotoId(item.id);
            }
          }}
          style={StyleSheet.absoluteFill}
        >
          <StImage
            uri={item.thumbnailUrl}
            style={{ width: "100%", height: "100%" }}
          />
          {index === 0 && !isEditMode && (
            <View className="absolute top-1.5 left-1.5">
              <Badge title="Главное фото" variant="accent" size="sm" />
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
                <StSvg name="Done_round" size={14} color={colors.neutral[0]} />
              )}
            </View>
          )}
          {isEditMode && isSelected && (
            <View className="absolute inset-0 bg-primary-blue-500/20" />
          )}
        </Pressable>
      </View>
    );
  };

  if (!auth) return null;

  return (
    <>
      <ScreenWithToolbar
        title="Галерея"
        rightButton={
          <View className="items-end w-[48px] h-[48px]">
            <View
              className={`absolute right-0 flex-row bg-background-surface h-[48px] items-center rounded-full ${
                !isEditMode && "px-2.5"
              }`}
            >
              {!isEditMode && (
                <IconButton
                  size="sm"
                  onPress={handleAddPhoto}
                  disabled={isUploading}
                  icon={
                    <StSvg
                      name="Add_round"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                />
              )}
              <IconButton
                size={isEditMode ? "md" : "sm"}
                onPress={toggleEditMode}
                icon={
                  <StSvg
                    name={isEditMode ? "Close_round" : "Edit_fill"}
                    size={24}
                    color={colors.neutral[900]}
                  />
                }
              />
            </View>
          </View>
        }
      >
        {({ topInset, bottomInset }) => (
          <View className="flex-1">
            {isGalleryLoading && !photos.length ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
              </View>
            ) : isGalleryError && !photos.length ? (
              <View className="flex-1 items-center justify-center px-screen">
                <Typography className="text-center text-error">
                  Не удалось загрузить галерею
                </Typography>
              </View>
            ) : (
              <>
                <FlashList
                  data={photos}
                  numColumns={2}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    paddingTop: topInset,
                    paddingHorizontal: HORIZONTAL_PADDING,
                    paddingBottom: bottomInset + (isEditMode ? 80 : 16),
                  }}
                  renderItem={renderItem}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                />

                {selectedIds !== null && selectedIds.size > 0 && (
                  <FloatingFooter offset={TAB_BAR_HEIGHT + 16}>
                    <Button
                      buttonClassName="bg-background-surface"
                      title={`Удалить (${selectedIds.size})`}
                      variant="destructive"
                      onPress={handleDeleteSelected}
                    />
                  </FloatingFooter>
                )}
              </>
            )}
          </View>
        )}
      </ScreenWithToolbar>

      {viewerIndex !== -1 && (
        <GalleryViewer
          photos={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerPhotoId(null)}
          onDelete={handleDelete}
          onSetCover={handleSetCover}
          onCropDone={handleCropDone}
        />
      )}

      {pendingPhotos !== null && (
        <PhotoUploadPreview
          photos={pendingPhotos}
          isUploading={isUploading}
          errorMessage={uploadError}
          onClose={() => {
            setPendingPhotos(null);
            setUploadError(null);
          }}
          onUpload={handleUploadAll}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  item: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    overflow: "hidden",
    marginBottom: GAP,
  },
  itemLeftColumn: {
    marginRight: GAP,
  },
});

export default Gallery;
