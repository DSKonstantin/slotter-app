import { Image, type ImageContentPosition, type ImageSource } from "expo-image";

type Props = {
  source: ImageSource;
  contentFit?: "contain" | "cover";
  contentPosition?: ImageContentPosition;
};

export const StoryIllustration = ({
  source,
  contentFit = "cover",
  contentPosition = "bottom",
}: Props) => {
  return (
    <Image
      source={source}
      style={{ flex: 1, width: "100%" }}
      contentFit={contentFit}
      contentPosition={contentPosition}
    />
  );
};
