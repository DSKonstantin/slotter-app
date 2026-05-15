import React from "react";
import { View, Alert } from "react-native";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type ViewerToolbarProps = {
  onSetCover: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ViewerToolbar({
  onSetCover,
  onEdit,
  onDelete,
}: ViewerToolbarProps) {
  const handleDelete = () => {
    Alert.alert("Удалить фото?", "Это действие нельзя отменить", [
      { text: "Отмена", style: "cancel" },
      { text: "Удалить", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View className="flex-row">
      <View className="flex-1 items-center gap-2 basis-[80px]">
        <IconButton
          icon={
            <StSvg name="Img_box_fill" size={24} color={colors.neutral[900]} />
          }
          onPress={onSetCover}
        />
        <Typography className="text-neutral-0 text-xs">
          Сделать обложкой
        </Typography>
      </View>

      <View className="flex-1 items-center gap-2 basis-[80px]">
        <IconButton
          icon={
            <StSvg name="Edit_fill" size={24} color={colors.neutral[900]} />
          }
          onPress={onEdit}
        />
        <Typography className="text-neutral-0 text-xs">
          Редактировать
        </Typography>
      </View>

      <View className="flex-1 items-center gap-2 basis-[80px]">
        <IconButton
          icon={<StSvg name="Trash" size={24} color={colors.accent.red[500]} />}
          onPress={handleDelete}
        />
        <Typography className="text-accent-red-500 text-xs">Удалить</Typography>
      </View>
    </View>
  );
}
