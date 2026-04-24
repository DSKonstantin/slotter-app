import type { User } from "@/src/store/redux/services/api-types/user";
import React, { useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  useWindowDimensions,
} from "react-native";
import type {
  NativeSyntheticEvent,
  TextLayoutEventData,
  ViewToken,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "@/src/components/ui/Avatar";
import { Tag } from "@/src/components/ui/Tag";
import { Typography } from "@/src/components/ui/Typography";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import { Badge, StImage, PlaceholderSlotter } from "@/src/components/ui";
import type { GalleryPhoto } from "@/src/store/redux/services/api-types";

type Props = { user: User };

const AboutMe = ({ text }: { text: string }) => {
  const [truncatedText, setTruncatedText] = useState<string | null>(null);

  const onHiddenLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      const lines = e.nativeEvent.lines;
      if (lines.length <= 2) return;

      const twoLines = lines
        .slice(0, 2)
        .map((l) => l.text)
        .join("")
        .trimEnd();
      const lastSpace = twoLines.lastIndexOf(" ", twoLines.length - 4);
      setTruncatedText(
        twoLines.slice(0, lastSpace > 0 ? lastSpace : twoLines.length - 4),
      );
    },
    [],
  );

  return (
    <View style={{ maxWidth: 250 }}>
      <Text
        style={{ position: "absolute", opacity: 0 }}
        className="font-inter-regular text-caption"
        onTextLayout={onHiddenLayout}
      >
        {text}
      </Text>
      <Text className="font-inter-regular text-caption text-neutral-0">
        {truncatedText !== null ? truncatedText : text}
        {truncatedText !== null && (
          <Text className="font-inter-semibold text-caption text-neutral-300">
            {" "}
            ... Ещё
          </Text>
        )}
      </Text>
    </View>
  );
};

type PreviewHeaderImageProps = { photos: GalleryPhoto[] };

const GRADIENT_COLORS: [string, string] = [
  "rgba(0,0,0,0.14)",
  "rgba(0,0,0,0.7)",
];
const GRADIENT_LOCATIONS: [number, number] = [0.5408, 1];
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 0, y: 1 };

const HeaderGradient = () => (
  <LinearGradient
    colors={GRADIENT_COLORS}
    locations={GRADIENT_LOCATIONS}
    start={GRADIENT_START}
    end={GRADIENT_END}
    style={StyleSheet.absoluteFill}
    pointerEvents="none"
  />
);

export const PreviewHeaderImage = ({ photos }: PreviewHeaderImageProps) => {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  if (photos.length === 0) {
    return (
      <>
        <View className="absolute inset-0 bg-background-black items-center justify-center">
          <PlaceholderSlotter size={80} />
        </View>
        <HeaderGradient />
      </>
    );
  }

  if (photos.length === 1) {
    const photo = photos[0];
    return (
      <>
        <StImage
          uri={photo.cropped_photo_url ?? photo.photo_url}
          blurhash={photo.blurhash}
          style={StyleSheet.absoluteFill}
        />
        <HeaderGradient />
      </>
    );
  }

  return (
    <>
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <StImage
            uri={item.cropped_photo_url ?? item.photo_url}
            blurhash={item.blurhash}
            style={{ width, height: "100%" }}
          />
        )}
        style={StyleSheet.absoluteFill}
      />
      <HeaderGradient />
      <View
        className="absolute bottom-3 flex-row self-center gap-1.5"
        pointerEvents="none"
      >
        {photos.map((photo, index) => (
          <View
            key={photo.id}
            className={`w-2 h-2 rounded-full ${
              index === activeIndex ? "bg-neutral-0" : "bg-neutral-0/40"
            }`}
          />
        ))}
      </View>
    </>
  );
};

export const PreviewHeaderContent = ({ user }: Props) => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return (
    <View
      className="flex-1 justify-end px-screen gap-2 pb-6"
      pointerEvents="none"
    >
      <View className="flex-row items-center gap-4">
        <Avatar uri={user.avatar_url ?? undefined} name={fullName} size="lg" />
        <View className="flex-1 gap-1">
          <Typography weight="semibold" className="text-2xl text-neutral-0">
            {fullName || "Имя не указано"}
          </Typography>
        </View>
      </View>
      {user.profession ? (
        <Badge title={user.profession} size="sm" variant="info" />
      ) : null}

      {user.about_me ? <AboutMe text={user.about_me} /> : null}

      {user.address ? (
        <Tag
          title={user.address}
          variant="default"
          size="sm"
          icon={<StSvg name="Pin_fill" size={16} color={colors.neutral[500]} />}
        />
      ) : null}
    </View>
  );
};
