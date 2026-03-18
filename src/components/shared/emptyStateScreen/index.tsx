import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/styles/colors";

type EmptyStateScreenProps = {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  buttonTitle: string;
  buttonIcon?: string;
  isLoading?: boolean;
  onPress: () => void;
};

const EmptyStateScreen: React.FC<EmptyStateScreenProps> = ({
  image,
  title,
  subtitle,
  buttonTitle,
  buttonIcon,
  isLoading = false,
  onPress,
}) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <>
      <View className="flex-1 items-center justify-center gap-4 px-screen pb-24">
        <Image
          source={image}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
        <View className="items-center gap-1">
          <Typography
            weight="semibold"
            className="text-display text-neutral-900"
          >
            {title}
          </Typography>
          <Typography className="text-body text-neutral-500 text-center">
            {subtitle}
          </Typography>
        </View>
      </View>
      <View
        className="px-screen"
        style={{ marginBottom: TAB_BAR_HEIGHT + bottom + 16 }}
      >
        <Button
          title={buttonTitle}
          loading={isLoading}
          onPress={onPress}
          rightIcon={
            buttonIcon ? (
              <StSvg name={buttonIcon} size={24} color={colors.neutral[0]} />
            ) : undefined
          }
        />
      </View>
    </>
  );
};

export default EmptyStateScreen;
