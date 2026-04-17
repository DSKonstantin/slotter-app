import React from "react";
import { Image, View } from "react-native";
import type { MessageImageProps } from "react-native-gifted-chat";
import type { ChatIMessage } from "@/src/utils/chat/types";

const IMAGE_WIDTH = 220;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.75;

const ChatMessageImages = ({
  currentMessage,
}: MessageImageProps<ChatIMessage>) => {
  if (!currentMessage) return null;

  const { image_urls, image } = currentMessage;
  const imageFiles = image_urls?.filter((f) =>
    f.content_type.startsWith("image/"),
  );

  if (imageFiles?.length) {
    return (
      <View style={{ gap: 2, margin: 4 }}>
        {imageFiles.map((f) => (
          <Image
            key={f.id}
            source={{ uri: f.url }}
            style={{
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
              borderRadius: 6,
            }}
            resizeMode="cover"
          />
        ))}
      </View>
    );
  }

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          borderRadius: 6,
          margin: 4,
        }}
        resizeMode="cover"
      />
    );
  }

  return null;
};

export default ChatMessageImages;
