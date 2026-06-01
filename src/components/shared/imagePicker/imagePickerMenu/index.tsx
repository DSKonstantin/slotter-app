import React from "react";
import { View } from "react-native";
import { Button, Card, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type ImagePickerMenuProps = {
  visible: boolean;
  title?: string;
  showFiles?: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onFiles?: () => void;
  onModalHide?: () => void;
};

const IconBox = ({
  bg,
  iconColor,
  name,
}: {
  bg: string;
  iconColor: string;
  name: string;
}) => (
  <View
    style={{ backgroundColor: bg }}
    className="w-10 h-10 rounded-xl items-center justify-center"
  >
    <StSvg name={name} size={20} color={iconColor} />
  </View>
);

const Chevron = () => (
  <StSvg name="Expand_right_light" size={20} color={colors.neutral[400]} />
);

const ImagePickerMenu = ({
  visible,
  title = "Выберите источник",
  showFiles = false,
  onClose,
  onCamera,
  onGallery,
  onFiles,
  onModalHide,
}: ImagePickerMenuProps) => (
  <StModal visible={visible} onClose={onClose} onModalHide={onModalHide}>
    <View className="gap-4">
      <Typography weight="semibold" className="text-display text-center">
        {title}
      </Typography>

      <View className="gap-2">
        <Card
          title="Сделать фото"
          subtitle="Откроется камера для снимка"
          left={
            <IconBox
              bg={colors.primary.blue[100]}
              iconColor={colors.primary.blue[500]}
              name="Camera"
            />
          }
          right={<Chevron />}
          onPress={onCamera}
        />

        <Card
          title="Галерея"
          subtitle="Выберите фото из галереи"
          left={
            <IconBox
              bg={colors.primary.green[100]}
              iconColor={colors.primary.green[400]}
              name="Img_box_fill"
            />
          }
          right={<Chevron />}
          onPress={onGallery}
        />

        {showFiles && onFiles && (
          <Card
            title="Документ"
            subtitle="Прикрепить файл с устройства"
            left={
              <IconBox
                bg={colors.accent.orange[100]}
                iconColor={colors.accent.orange[500]}
                name="File_dock_fill"
              />
            }
            right={<Chevron />}
            onPress={onFiles}
          />
        )}
      </View>

      <Button title="Отмена" variant="clear" onPress={onClose} />
    </View>
  </StModal>
);

export default ImagePickerMenu;
