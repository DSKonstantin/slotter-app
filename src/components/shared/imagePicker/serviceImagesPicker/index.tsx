import type { ImagePickerAsset, ImagePickerOptions } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";

import React, { useMemo, useState, useCallback } from "react";
import { Pressable, View } from "react-native";
import { nanoid } from "nanoid/non-secure";

import { Typography, Divider } from "@/src/components/ui";
import { useImagePicker } from "@/src/hooks/useImagePicker";
import ImagePickerMenu from "@/src/components/shared/imagePicker/imagePickerMenu";
import PhotoPreview from "@/src/components/shared/imagePicker/serviceImagesPicker/PhotoPreview";
import EmptySlot from "@/src/components/shared/imagePicker/serviceImagesPicker/EmptySlot";

export type PhotoAsset =
  | (ImagePickerAsset & { id: string })
  | (DocumentPickerAsset & { id: string });

export type PhotoAction = "keep" | "upload" | "clear";

export type PhotoSlot = {
  serverUrl: string | null;
  localAsset: PhotoAsset | null;
  action: PhotoAction;
};

export type AdditionalPhotosState = [
  PhotoSlot,
  PhotoSlot,
  PhotoSlot,
  PhotoSlot,
];

export type ServicePhotosValue = {
  mainPhoto: PhotoSlot;
  additionalPhotos: AdditionalPhotosState;
};

type Props = {
  value: ServicePhotosValue;
  onChange: (next: ServicePhotosValue) => void;
};

type PickerAsset = ImagePickerAsset | DocumentPickerAsset;

export const MAX_ADDITIONAL_PHOTOS = 4;
const ADDITIONAL_PHOTO_ROW_SIZE = 2;

type MenuState =
  | { open: false }
  | {
      open: true;
      title: string;
      message?: string;
      onCamera: () => void | Promise<void>;
      onGallery: () => void | Promise<void>;
      onFiles?: () => void | Promise<void>;
    };

const REQUIREMENTS = [
  "Формат JPG или PNG, до 5 МБ",
  "Минимум 800×600 px (лучше 1200×900)",
  "Без водяных знаков и чужих логотипов",
  "Хорошее освещение, чёткий фокус",
] as const;

export const createEmptyPhotoSlot = (
  serverUrl: string | null = null,
): PhotoSlot => ({
  serverUrl,
  localAsset: null,
  action: "keep",
});

export const createDefaultServicePhotos = (): ServicePhotosValue => ({
  mainPhoto: createEmptyPhotoSlot(),
  additionalPhotos: [
    createEmptyPhotoSlot(),
    createEmptyPhotoSlot(),
    createEmptyPhotoSlot(),
    createEmptyPhotoSlot(),
  ],
});

export function ServiceImagesPicker({ value, onChange }: Props) {
  const [menu, setMenu] = useState<MenuState>({ open: false });
  const { pickFromCamera, pickFromGallery, pickFromFiles } = useImagePicker();

  const closeMenu = useCallback(() => setMenu({ open: false }), []);

  const update = useCallback(
    (patch: Partial<ServicePhotosValue>) => {
      onChange({ ...value, ...patch });
    },
    [onChange, value],
  );

  const toPhotoAsset = useCallback((asset: PickerAsset): PhotoAsset => {
    return { ...asset, id: nanoid() };
  }, []);

  const getSlotUri = useCallback((slot: PhotoSlot): string | null => {
    if (slot.action === "clear") return null;
    if (slot.localAsset?.uri) return slot.localAsset.uri;
    return slot.serverUrl;
  }, []);

  const updateMainPhoto = useCallback(
    (slot: PhotoSlot) => {
      update({ mainPhoto: slot });
    },
    [update],
  );

  const updateAdditionalSlot = useCallback(
    (index: number, updater: (slot: PhotoSlot) => PhotoSlot) => {
      const next = value.additionalPhotos.map((slot, slotIndex) =>
        slotIndex === index ? updater(slot) : slot,
      ) as AdditionalPhotosState;

      update({ additionalPhotos: next });
    },
    [update, value.additionalPhotos],
  );

  const setMainPhoto = useCallback(
    (asset: PickerAsset) => {
      updateMainPhoto({
        ...value.mainPhoto,
        localAsset: toPhotoAsset(asset),
        action: "upload",
      });
    },
    [toPhotoAsset, updateMainPhoto, value.mainPhoto],
  );

  const clearMainPhoto = useCallback(() => {
    updateMainPhoto({
      ...value.mainPhoto,
      localAsset: null,
      action: value.mainPhoto.serverUrl ? "clear" : "keep",
    });
  }, [updateMainPhoto, value.mainPhoto]);

  const addAdditionalPhotos = useCallback(
    (assets: PickerAsset[]) => {
      if (!assets?.length) return;

      const emptyIndexes = value.additionalPhotos
        .map((slot, index) => (getSlotUri(slot) ? -1 : index))
        .filter((index) => index >= 0);

      if (!emptyIndexes.length) return;

      const next = [...value.additionalPhotos] as AdditionalPhotosState;
      const assetsToPlace = assets.slice(0, emptyIndexes.length);

      assetsToPlace.forEach((asset, assetIndex) => {
        const slotIndex = emptyIndexes[assetIndex];
        const current = next[slotIndex];

        next[slotIndex] = {
          ...current,
          localAsset: toPhotoAsset(asset),
          action: "upload",
        };
      });

      update({ additionalPhotos: next });
    },
    [getSlotUri, toPhotoAsset, update, value.additionalPhotos],
  );

  const replaceAdditionalPhoto = useCallback(
    (index: number, asset: PickerAsset) => {
      updateAdditionalSlot(index, (slot) => ({
        ...slot,
        localAsset: toPhotoAsset(asset),
        action: "upload",
      }));
    },
    [toPhotoAsset, updateAdditionalSlot],
  );

  const clearAdditionalPhoto = useCallback(
    (index: number) => {
      updateAdditionalSlot(index, (slot) => ({
        ...slot,
        localAsset: null,
        action: slot.serverUrl ? "clear" : "keep",
      }));
    },
    [updateAdditionalSlot],
  );

  const openPickerMenu = useCallback(
    ({
      title,
      message = "Выберите источник",
      options,
      onPick,
    }: {
      title: string;
      message?: string;
      options: ImagePickerOptions;
      onPick: (assets: PickerAsset[] | null) => void;
    }) => {
      setMenu({
        open: true,
        title,
        message,
        onCamera: async () => {
          onPick(await pickFromCamera(options));
          closeMenu();
        },
        onGallery: async () => {
          onPick(await pickFromGallery(options));
          closeMenu();
        },
        onFiles: async () => {
          onPick(await pickFromFiles(options));
          closeMenu();
        },
      });
    },
    [closeMenu, pickFromCamera, pickFromFiles, pickFromGallery],
  );

  const openMainPhotoMenu = useCallback(() => {
    openPickerMenu({
      title: getSlotUri(value.mainPhoto)
        ? "Заменить титульное фото"
        : "Добавить титульное фото",
      options: {
        allowsMultipleSelection: false,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 1,
      },
      onPick: (assets) => {
        const asset = assets?.[0];
        if (asset) setMainPhoto(asset);
      },
    });
  }, [getSlotUri, openPickerMenu, setMainPhoto, value.mainPhoto]);

  const openAdditionalAddMenu = useCallback(() => {
    const selectionLimit = value.additionalPhotos.filter(
      (slot) => !getSlotUri(slot),
    ).length;

    if (selectionLimit <= 0) return;

    openPickerMenu({
      title: "Добавить фото услуги",
      options: {
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 1,
        orderedSelection: true,
        selectionLimit,
      },
      onPick: (assets) => {
        if (assets?.length) addAdditionalPhotos(assets);
      },
    });
  }, [addAdditionalPhotos, getSlotUri, openPickerMenu, value.additionalPhotos]);

  const openAdditionalReplaceMenu = useCallback(
    (index: number) => {
      openPickerMenu({
        title: "Заменить фото услуги",
        options: {
          allowsMultipleSelection: false,
          aspect: [4, 3],
          quality: 1,
        },
        onPick: (assets) => {
          const asset = assets?.[0];
          if (asset) replaceAdditionalPhoto(index, asset);
        },
      });
    },
    [openPickerMenu, replaceAdditionalPhoto],
  );

  const additionalRows = useMemo(() => {
    const rows: number[][] = [];

    for (let i = 0; i < MAX_ADDITIONAL_PHOTOS; i += ADDITIONAL_PHOTO_ROW_SIZE) {
      rows.push(
        Array.from(
          {
            length: Math.min(
              ADDITIONAL_PHOTO_ROW_SIZE,
              MAX_ADDITIONAL_PHOTOS - i,
            ),
          },
          (_, offset) => i + offset,
        ),
      );
    }

    return rows;
  }, []);

  const renderAdditionalSlot = useCallback(
    (index: number) => {
      const slot = value.additionalPhotos[index];
      const uri = getSlotUri(slot);

      return (
        <View key={index} className="flex-1">
          <Pressable
            onPress={() => {
              if (uri) {
                openAdditionalReplaceMenu(index);
              } else {
                openAdditionalAddMenu();
              }
            }}
          >
            {uri ? (
              <PhotoPreview
                uri={uri}
                radius={14}
                onRemove={() => clearAdditionalPhoto(index)}
              />
            ) : (
              <EmptySlot variant="other" />
            )}
          </Pressable>
        </View>
      );
    },
    [
      clearAdditionalPhoto,
      getSlotUri,
      openAdditionalAddMenu,
      openAdditionalReplaceMenu,
      value.additionalPhotos,
    ],
  );

  const mainPhotoUri = getSlotUri(value.mainPhoto);

  return (
    <>
      <View className="mb-3">
        <Typography className="text-caption text-neutral-500 mb-2">
          Фото услуги (необязательно)
        </Typography>

        <View className="flex-row items-stretch gap-3 h-[153px]">
          <View className="flex-1">
            <Typography
              weight="regular"
              className="text-caption text-neutral-500 mb-3"
            >
              Титульное фото
            </Typography>

            <Pressable onPress={openMainPhotoMenu} className="flex-1">
              {mainPhotoUri ? (
                <PhotoPreview
                  uri={mainPhotoUri}
                  radius={20}
                  onRemove={clearMainPhoto}
                />
              ) : (
                <EmptySlot variant="title" />
              )}
            </Pressable>
          </View>

          <View className="flex-1">
            <Typography
              weight="regular"
              className="text-caption text-neutral-500 mb-3"
            >
              Остальные фото
            </Typography>

            <View className="flex-1 gap-2">
              {additionalRows.map((row, rowIndex) => (
                <View key={rowIndex} className="flex-row flex-1 gap-2">
                  {row.map((index) => renderAdditionalSlot(index))}
                </View>
              ))}
            </View>
          </View>
        </View>

        <Typography className="text-caption text-neutral-500 mt-6 mb-3">
          Требования
        </Typography>

        <View className="bg-background-surface rounded-3xl p-5 gap-1">
          {REQUIREMENTS.map((text, index) => (
            <View key={text} className="gap-4">
              <Typography weight="regular" className="text-body">
                {text}
              </Typography>
              {index < REQUIREMENTS.length - 1 ? (
                <Divider className="mb-4" />
              ) : null}
            </View>
          ))}
        </View>
      </View>

      {menu.open && (
        <ImagePickerMenu
          visible
          onClose={closeMenu}
          title={menu.title}
          message={menu.message}
          onCamera={menu.onCamera}
          onGallery={menu.onGallery}
          onFiles={menu.onFiles}
        />
      )}
    </>
  );
}
