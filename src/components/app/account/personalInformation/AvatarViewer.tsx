import React from "react";
import { View } from "react-native";
import { CameraType } from "expo-image-picker";
import ImageViewer from "@/src/components/shared/imageViewer";
import { TopGradientBar } from "@/src/components/shared/imageViewer/TopGradientBar";
import { BottomGradientBar } from "@/src/components/shared/imageViewer/BottomGradientBar";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import ImagePickerTrigger, {
  type PickedAssets,
} from "@/src/components/shared/imagePicker/imagePickerTrigger";

type Props = {
  uri: string;
  onClose: () => void;
  onPick: (assets: PickedAssets) => void;
  onDelete: () => void;
};

const AvatarViewer = ({ uri, onClose, onPick, onDelete }: Props) => (
  <ImageViewer
    images={[{ id: "avatar", uri }]}
    initialIndex={0}
    onClose={onClose}
    renderHeader={() => (
      <TopGradientBar>
        <IconButton
          onPress={onClose}
          icon={
            <StSvg name="Close_round" size={24} color={colors.neutral[900]} />
          }
        />
      </TopGradientBar>
    )}
    renderFooter={() => (
      <BottomGradientBar>
        <View className="flex-row">
          <View className="flex-1 items-center gap-2 basis-[80px]">
            <ImagePickerTrigger
              title="Фото профиля"
              options={{ aspect: [1, 1], cameraType: CameraType.front }}
              includeFiles
              onPick={(assets) => {
                onPick(assets);
                onClose();
              }}
            >
              <View className="items-center gap-2">
                <View className="items-center justify-center rounded-full bg-background-surface h-12 w-12">
                  <StSvg
                    name="Edit_fill"
                    size={24}
                    color={colors.neutral[900]}
                  />
                </View>
                <Typography className="text-neutral-0 text-xs">
                  Редактировать
                </Typography>
              </View>
            </ImagePickerTrigger>
          </View>

          <View className="flex-1 items-center gap-2 basis-[80px]">
            <IconButton
              icon={
                <StSvg name="Trash" size={24} color={colors.accent.red[500]} />
              }
              onPress={onDelete}
            />
            <Typography className="text-accent-red-500 text-xs">
              Удалить
            </Typography>
          </View>
        </View>
      </BottomGradientBar>
    )}
  />
);

export default AvatarViewer;
