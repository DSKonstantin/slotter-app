import { Image, type ImageContentPosition, type ImageSource } from "expo-image";

type Props = {
  source: ImageSource;
  contentPosition?: ImageContentPosition;
};

export const StoryIllustration = ({
  source,
  contentPosition = "bottom",
}: Props) => {
  return (
    <Image
      source={source}
      style={{ flex: 1, width: "100%" }}
      contentFit="contain"
      contentPosition={contentPosition}
    />
  );
};
