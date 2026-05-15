import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { fitContainer } from "react-native-zoom-toolkit";

type Props = {
  uri: string;
};

const ZoomableImage = ({ uri }: Props) => {
  const { width, height } = useWindowDimensions();
  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const size = resolution
    ? fitContainer(resolution.width / resolution.height, { width, height })
    : { width, height };

  return (
    <View
      style={{ width, height, justifyContent: "center", alignItems: "center" }}
    >
      <Image
        source={{ uri }}
        style={size}
        resizeMode="contain"
        onLoad={(e) => {
          setResolution({
            width: e.nativeEvent.source.width,
            height: e.nativeEvent.source.height,
          });
          setLoading(false);
        }}
        onError={() => setLoading(false)}
      />
      {loading && (
        <ActivityIndicator color="white" style={StyleSheet.absoluteFill} />
      )}
    </View>
  );
};

export default ZoomableImage;
