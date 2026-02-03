import type { ImagePickerAsset, ImagePickerOptions } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";

import React, { useState, useCallback } from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { nanoid } from "nanoid/non-secure";

import { Typography, StSvg, Divider } from "@/src/components/ui";
import { useImagePicker } from "@/src/hooks/useImagePicker";
import { colors } from "@/src/styles/colors";
import ImagePickerMenu from "@/src/components/shared/imagePickerMenu";

export type PhotoAsset =
  | (ImagePickerAsset & { id: string })
  | (DocumentPickerAsset & { id: string });

export type ServicePhotosValue = {
  titlePhoto: { assets: PhotoAsset[]; max: number };
  otherPhoto: { assets: PhotoAsset[]; max: number };
};

type Props = {
  value: ServicePhotosValue;
  onChange: (next: ServicePhotosValue) => void;
};

type MenuState =
  | { open: false }
  | {
      open: true;
      title: string;
      message?: string;
      mode: "title" | "other";
      action: "add" | "replace";
      replaceId?: string;
      onCamera: () => void | Promise<void>;
      onGallery: () => void | Promise<void>;
      onFiles?: () => void | Promise<void>;
    };

export function ServiceImagesPicker({ value, onChange }: Props) {
  const [menu, setMenu] = useState<MenuState>({ open: false });
  const { pickFromCamera, pickFromGallery, pickFromFiles } = useImagePicker();
  const title = value.titlePhoto.assets[0] ?? null;
  const other = value.otherPhoto.assets;

  const closeMenu = useCallback(() => setMenu({ open: false }), []);

  const update = useCallback(
    (patch: Partial<ServicePhotosValue>) => {
      onChange({ ...value, ...patch });
    },
    [onChange, value],
  );

  const setTitle = useCallback(
    (asset: ImagePickerAsset | DocumentPickerAsset) => {
      const next: PhotoAsset = { ...asset, id: nanoid() };

      update({
        titlePhoto: {
          ...value.titlePhoto,
          assets: [next],
        },
      });
    },
    [update, value.titlePhoto],
  );

  const addOther = useCallback(
    (assets: ImagePickerAsset[] | DocumentPickerAsset[]) => {
      if (!assets?.length) return;

      const mapped: PhotoAsset[] = assets.map((a) => ({ ...a, id: nanoid() }));

      const next = [...other, ...mapped].slice(0, value.otherPhoto.max);

      update({
        otherPhoto: {
          ...value.otherPhoto,
          assets: next,
        },
      });
    },
    [other, update, value.otherPhoto],
  );

  const replaceOther = useCallback(
    (id: string, asset: ImagePickerAsset | DocumentPickerAsset) => {
      const next = other.map((x) => (x.id === id ? { ...asset, id } : x));

      update({
        otherPhoto: {
          ...value.otherPhoto,
          assets: next,
        },
      });
    },
    [other, update, value.otherPhoto],
  );

  const openTitleMenu = useCallback(() => {
    const options: ImagePickerOptions = {
      allowsMultipleSelection: false,
      aspect: [4, 3],
      quality: 1,
    };

    setMenu({
      open: true,
      mode: "title",
      action: "replace",
      title: title ? "Заменить титульное фото" : "Добавить титульное фото",
      message: "Выберите источник",
      onCamera: async () => {
        const assets = await pickFromCamera(options);
        const a = assets?.[0];
        if (a) setTitle(a);
        closeMenu();
      },

      onGallery: async () => {
        const assets = await pickFromGallery(options);
        const a = assets?.[0];
        if (a) setTitle(a);
        closeMenu();
      },

      onFiles: async () => {
        const assets = await pickFromFiles(options);
        const a = assets?.[0];
        if (a) setTitle(a);
        closeMenu();
      },
    });
  }, [
    title,
    pickFromCamera,
    setTitle,
    closeMenu,
    pickFromGallery,
    pickFromFiles,
  ]);

  const openOtherAddMenu = useCallback(() => {
    const options: ImagePickerOptions = {
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
      orderedSelection: true,
      selectionLimit: value.otherPhoto.max - other.length,
    };

    setMenu({
      open: true,
      mode: "other",
      action: "add",
      title: "Добавить фото услуги",
      message: "Выберите источник",

      onCamera: async () => {
        const assets = await pickFromCamera(options);
        if (assets?.length) addOther(assets);
        closeMenu();
      },

      onGallery: async () => {
        const assets = await pickFromGallery(options);
        if (assets?.length) addOther(assets);
        closeMenu();
      },

      onFiles: async () => {
        const assets = await pickFromFiles(options);
        if (assets?.length) addOther(assets);
        closeMenu();
      },
    });
  }, [
    value.otherPhoto.max,
    other.length,
    pickFromCamera,
    addOther,
    closeMenu,
    pickFromGallery,
    pickFromFiles,
  ]);

  const openOtherReplaceMenu = useCallback(
    (id: string) => {
      const options: ImagePickerOptions = {
        allowsMultipleSelection: false,
        aspect: [4, 3],
        quality: 1,
      };

      setMenu({
        open: true,
        title: "Заменить фото услуги",
        message: "Выберите источник",
        mode: "other",
        action: "replace",

        onCamera: async () => {
          const assets = await pickFromCamera(options);
          const a = assets?.[0];
          if (a) replaceOther(id, a);
          closeMenu();
        },

        onGallery: async () => {
          const assets = await pickFromGallery(options);
          const a = assets?.[0];
          if (a) replaceOther(id, a);
          closeMenu();
        },

        onFiles: async () => {
          const assets = await pickFromFiles(options);
          const a = assets?.[0];
          if (a) replaceOther(id, a);
          closeMenu();
        },
      });
    },
    [pickFromCamera, replaceOther, closeMenu, pickFromGallery, pickFromFiles],
  );

  const removeTitle = useCallback(() => {
    update({
      titlePhoto: {
        ...value.titlePhoto,
        assets: [],
      },
    });
  }, [update, value.titlePhoto]);

  const removeOtherById = useCallback(
    (id: string) => {
      update({
        otherPhoto: {
          ...value.otherPhoto,
          assets: other.filter((x) => x.id !== id),
        },
      });
    },
    [other, update, value.otherPhoto],
  );

  return (
    <>
      <View className="mb-3">
        <Typography
          weight="medium"
          className="text-caption text-neutral-500 mb-2"
        >
          Фото услуги (необязательно)
        </Typography>

        <View className="flex-row items-stretch gap-3 h-[153px]">
          <View className="flex-1">
            <Typography className="text-caption text-neutral-500 mb-3">
              Титульное фото
            </Typography>

            <Pressable onPress={openTitleMenu} className="flex-1">
              {title ? (
                <PhotoPreview
                  uri={title.uri}
                  radius={20}
                  mode="title"
                  onRemove={removeTitle}
                />
              ) : (
                <EmptySlot variant="title" />
              )}
            </Pressable>
          </View>

          <View className="flex-1">
            <Typography className="text-caption text-neutral-500 mb-3">
              Остальные фото
            </Typography>

            <View className="flex-row flex-wrap flex-1 gap-2 mb-2">
              {Array.from({ length: 2 }).map((_, i) => {
                const img = other[i];

                return (
                  <View key={i} className="flex-1">
                    <Pressable
                      onPress={() => {
                        if (img) openOtherReplaceMenu(img.id);
                        else openOtherAddMenu();
                      }}
                    >
                      {img ? (
                        <PhotoPreview
                          uri={img.uri}
                          radius={14}
                          mode="other"
                          onRemove={() => removeOtherById(img.id)}
                        />
                      ) : (
                        <EmptySlot variant="other" />
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
            <View className="flex-row flex-wrap flex-1 gap-2">
              {Array.from({ length: 2 }).map((_, i) => {
                const img = other[i + 2];

                return (
                  <View key={i} className="flex-1">
                    <Pressable
                      onPress={() => {
                        if (img) openOtherReplaceMenu(img.id);
                        else openOtherAddMenu();
                      }}
                    >
                      {img ? (
                        <PhotoPreview
                          uri={img.uri}
                          radius={14}
                          mode="other"
                          onRemove={() => removeOtherById(img.id)}
                        />
                      ) : (
                        <EmptySlot variant="other" />
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <Typography className="text-caption text-neutral-500 mt-6 mb-3">
          Требования
        </Typography>

        <View className="bg-background-surface rounded-3xl p-5 gap-1">
          <View className="gap-4">
            <Typography className="text-body">
              Формат JPG или PNG, до 5 МБ
            </Typography>
            <Divider className="mb-4" />
          </View>

          <View className="gap-4">
            <Typography className="text-body">
              Минимум 800×600 px (лучше 1200×900)
            </Typography>
            <Divider className="mb-4" />
          </View>

          <View className="gap-4">
            <Typography className="text-body">
              Без водяных знаков и чужих логотипов
            </Typography>
            <Divider className="mb-4" />
          </View>

          <View className="gap-4">
            <Typography className="text-body">
              Хорошее освещение, чёткий фокус
            </Typography>
          </View>
        </View>
      </View>
      {menu.open && (
        <ImagePickerMenu
          visible={menu.open}
          onClose={closeMenu}
          title={menu.open ? menu.title : ""}
          message={menu.open ? menu.message : ""}
          onCamera={menu?.onCamera}
          onGallery={menu.onGallery}
          onFiles={menu.onFiles}
        />
      )}
    </>
  );
}

function PhotoPreview({
  uri,
  radius,
  mode,
  onRemove,
}: {
  uri: string;
  radius: number;
  mode: "title" | "other";
  onRemove: () => void;
}) {
  return (
    <View className="relative">
      <Image
        source={{ uri }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius,
        }}
        contentFit="cover"
      />

      <Pressable
        onPress={onRemove}
        hitSlop={10}
        className="absolute -top-2 -right-2 rounded-full w-[24px] h-[24px] bg-white items-center justify-center"
      >
        <StSvg
          name="Close_round_fill_light"
          size={18}
          color={colors.neutral[900]}
        />
      </Pressable>
    </View>
  );
}

function EmptySlot({ variant }: { variant: "title" | "other" }) {
  return (
    <View
      className="border border-neutral-500 border-dashed rounded-small justify-center items-center"
      style={{
        height: variant === "title" ? 123 : 58,
      }}
    >
      <View className="items-center justify-center">
        <StSvg
          name="Add_ring_fill_light"
          size={variant === "title" ? 40 : 24}
          color={colors.neutral[400]}
        />
      </View>
    </View>
  );
}
