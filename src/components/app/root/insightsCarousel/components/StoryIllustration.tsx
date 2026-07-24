import { Image, type ImageSource } from "expo-image";

type Props = {
  source: ImageSource;
};

// Обрезанная иллюстрация под заголовком (см. educationPayments/*,
// fillProfile/two-four). Раньше высота считалась вручную через
// width: "100%" + aspectRatio — на невысоких экранах это могло требовать
// больше вертикального места, чем осталось в flex-контейнере, и картинку
// обрезало. contentFit="contain" сам сохраняет пропорции без переполнения,
// а contentPosition="bottom" прижимает картинку к низу вместо обёртки
// с justify-end.
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
