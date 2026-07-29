import { Image, type ImageSource } from "expo-image";

type Props = {
  source: ImageSource;
};

export const StoryIllustration = ({ source }: Props) => {
  return (
    <Image
      source={source}
      style={{ flex: 1, width: "100%" }}
      contentFit="contain"
      contentPosition="bottom"
    />
  );
};
