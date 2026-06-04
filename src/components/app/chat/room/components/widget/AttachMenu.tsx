import React from "react";
import { View } from "react-native";
import { Card, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import ImagePickerTrigger from "@/src/components/shared/imagePicker/imagePickerTrigger";
import type { PickedAssets } from "@/src/components/shared/imagePicker/imagePickerTrigger";

type Props = {
  onPickService: () => void;
  onProposeAppointment: () => void;
  onAttachFile: (assets: PickedAssets) => void;
  isUser?: boolean;
};

const AttachMenu = ({
  onPickService,
  onProposeAppointment,
  onAttachFile,
  isUser,
}: Props) => (
  <View className="gap-2">
    <ImagePickerTrigger
      title="Прикрепить файл"
      includeFiles
      options={{
        allowsMultipleSelection: true,
        selectionLimit: 10,
        allowsEditing: false,
      }}
      onPick={onAttachFile}
    >
      <Card
        title="Фото или файл"
        subtitle="Изображение или документ"
        left={<StSvg name="paper_clip" size={24} color={colors.neutral[900]} />}
        right={
          <StSvg
            name="Expand_right_light"
            size={24}
            color={colors.neutral[500]}
          />
        }
      />
    </ImagePickerTrigger>

    {isUser && (
      <>
        <Card
          title="Предложить запись"
          subtitle="Создаст запись и отправит её клиенту"
          left={
            <StSvg name="Date_today" size={24} color={colors.neutral[900]} />
          }
          onPress={onProposeAppointment}
          right={
            <StSvg
              name="Expand_right_light"
              size={24}
              color={colors.neutral[500]}
            />
          }
        />
        <Card
          title="Прикрепить услугу"
          subtitle="Карточка услуги в чате"
          left={
            <StSvg
              name="File_dock_fill"
              size={24}
              color={colors.neutral[900]}
            />
          }
          onPress={onPickService}
          right={
            <StSvg
              name="Expand_right_light"
              size={24}
              color={colors.neutral[500]}
            />
          }
        />
      </>
    )}
  </View>
);

export default AttachMenu;
