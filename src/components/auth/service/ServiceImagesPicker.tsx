import React, { useMemo, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { nanoid } from "nanoid/non-secure";

import { Typography, StSvg, Button } from "@/src/components/ui";
import { ImagePickerTrigger } from "@/src/components/ui/ImagePickerTrigger";
import { StModal } from "@/src/components/ui/StModal";
import { PickedFile, useImagePicker } from "@/src/hooks/useImagePicker";

export type ServiceImage = PickedFile & { id: string };

type ServiceImagesPickerProps = {
  value: ServiceImage[];
  onChange: (next: ServiceImage[]) => void;

  max?: number;
};

export function ServiceImagesPicker({
  value,
  onChange,
  max = 10,
}: ServiceImagesPickerProps) {
  const { openPickerMenu } = useImagePicker();

  const images = value ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => images.find((x) => x.id === selectedId) ?? null,
    [images, selectedId],
  );

  const canAddMore = images.length < max;

  const addImage = (asset: PickedFile) => {
    if (!canAddMore) return;

    const next: ServiceImage = {
      ...asset,
      id: nanoid(),
    };

    onChange([...images, next]);
  };

  const removeImage = (id: string) => {
    onChange(images.filter((x) => x.id !== id));
    setSelectedId(null);
  };

  const replaceImage = (id: string) => {
    openPickerMenu({
      title: "Заменить фото",
      message: "Выберите источник",
      options: { aspect: [1, 1], allowsEditing: true },
      onPick: (asset) => {
        onChange(
          images.map((img) => (img.id === id ? { ...img, ...asset } : img)),
        );
        setSelectedId(null);
      },
    });
  };

  return (
    <View className="gap-2">
      <Typography weight="medium" className="text-caption text-gray">
        Фото услуги (необязательно)
      </Typography>

      {/* ✅ ADD / PREVIEW */}
      <ImagePickerTrigger
        title="Загрузить фото"
        disabled={!canAddMore}
        onPick={(asset) => addImage(asset)}
        options={{ aspect: [1, 1] }}
      >
        <View className="p-2 border justify-center items-center border-gray rounded-3xl border-dashed gap-1 h-[116px]">
          <StSvg name="layers" size={40} color="black" />
          <Typography weight="medium" className="text-body">
            Добавить фото
          </Typography>
        </View>
      </ImagePickerTrigger>
      <Typography weight="medium" className="text-caption text-gray">
        Постарайся выбрать крутые фотки, с ними клиентов будет больше
      </Typography>

      {/* ✅ THUMBNAILS */}
      {images.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-1">
          {images.map((img) => (
            <Pressable
              key={img.id}
              onPress={() => setSelectedId(img.id)}
              className="relative"
            >
              <Image
                source={{ uri: img.uri }}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 16,
                }}
              />
            </Pressable>
          ))}
        </View>
      )}

      {/* ✅ ACTIONS MODAL */}
      <StModal visible={!!selectedId} onClose={() => setSelectedId(null)}>
        <View className="gap-3 pb-3">
          <Typography weight="semibold" className="text-display">
            Фото
          </Typography>

          {!!selected && (
            <View className="items-center">
              <Image
                source={{ uri: selected.uri }}
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  borderRadius: 24,
                }}
              />
            </View>
          )}

          <Button
            title="Заменить"
            onPress={() => selectedId && replaceImage(selectedId)}
            disabled={!selectedId}
          />

          <Button
            title="Удалить"
            variant="clear"
            onPress={() => selectedId && removeImage(selectedId)}
            disabled={!selectedId}
          />
        </View>
      </StModal>
    </View>
  );
}
