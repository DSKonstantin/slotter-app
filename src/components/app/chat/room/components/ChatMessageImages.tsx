import React, { useMemo, useState } from "react";
import { Image, Pressable, View } from "react-native";
import type { MessageImageProps } from "react-native-gifted-chat";
import type { ChatIMessage } from "@/src/utils/chat/types";
import ImageViewer, {
  type ImageItem,
} from "@/src/components/shared/imageViewer";

const IMAGE_WIDTH = 220;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.75;

const ChatMessageImages = ({
  currentMessage,
}: MessageImageProps<ChatIMessage>) => {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const items = useMemo<ImageItem[]>(() => {
    if (!currentMessage) return [];
    const files = currentMessage.images?.filter((f) =>
      f.content_type.startsWith("image/"),
    );
    if (files?.length) {
      return files.map((f) => ({ id: String(f.id), uri: f.url }));
    }
    if (currentMessage.image) {
      return [{ id: "single", uri: currentMessage.image }];
    }
    return [];
  }, [currentMessage]);

  if (!items.length) return null;

  return (
    <>
      <View style={{ gap: 2, margin: 4 }}>
        {items.map((item, index) => (
          <Pressable key={item.id} onPress={() => setViewerIndex(index)}>
            <Image
              source={{ uri: item.uri }}
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                borderRadius: 6,
              }}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </View>

      {viewerIndex !== null && (
        <ImageViewer
          images={items}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
};

export default ChatMessageImages;
