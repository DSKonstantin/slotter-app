import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  PanResponder,
  type ViewStyle,
} from "react-native";
import {
  CropZoom,
  useImageResolution,
  type CropZoomRefType,
} from "react-native-zoom-toolkit";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Button, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { CropData } from "./types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CROP_SIDE_MARGIN = 24;
const DEFAULT_CROP_WIDTH = Math.min(SCREEN_WIDTH * 0.82, SCREEN_WIDTH);
const DEFAULT_CROP_HEIGHT = SCREEN_HEIGHT * 0.5;
const MAX_CROP_WIDTH = SCREEN_WIDTH - CROP_SIDE_MARGIN * 2;
const MAX_CROP_HEIGHT = SCREEN_HEIGHT * 0.68;
const MIN_CROP_WIDTH = 160;
const MIN_CROP_HEIGHT = 160;
const HANDLE_TOUCH_SIZE = 40;

type CropSize = {
  width: number;
  height: number;
};

type ResizeCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

type ResizeHandleResponders = Record<
  ResizeCorner,
  ReturnType<typeof PanResponder.create>
>;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

type CropOverlayProps = {
  cropSize: CropSize;
  handlePanResponders: ResizeHandleResponders;
};

function CropOverlay({ cropSize, handlePanResponders }: CropOverlayProps) {
  const borderStyle: ViewStyle = {
    width: cropSize.width,
    height: cropSize.height,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  };

  const cornerSize = 20;
  const cornerThickness = 3;
  const cornerColor = "#fff";

  const corners: ViewStyle[] = [
    { top: cornerThickness, left: cornerThickness },
    { top: cornerThickness, right: cornerThickness },
    { bottom: cornerThickness, left: cornerThickness },
    { bottom: cornerThickness, right: cornerThickness },
  ];

  return (
    <View
      pointerEvents="box-none"
      style={{
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View className="flex-1 bg-black/50" />
        <View style={{ flexDirection: "row", height: cropSize.height }}>
          <View className="flex-1 bg-black/50" />
          <View style={{ width: cropSize.width }} />
          <View className="flex-1 bg-black/50" />
        </View>
        <View className="flex-1 bg-black/50" />
      </View>

      <View
        pointerEvents="box-none"
        style={[
          styles.cropFrame,
          { width: cropSize.width, height: cropSize.height },
        ]}
      >
        <View pointerEvents="none" style={borderStyle}>
          {corners.map((corner, i) => (
            <View key={i} style={[{ position: "absolute" }, corner]}>
              <View
                style={{
                  width: cornerSize,
                  height: cornerThickness,
                  backgroundColor: cornerColor,
                }}
              />
              <View
                style={{
                  width: cornerThickness,
                  height: cornerSize - cornerThickness,
                  backgroundColor: cornerColor,
                  position: "absolute",
                  top: 0,
                  ...(corner.left !== undefined ? { left: 0 } : { right: 0 }),
                }}
              />
            </View>
          ))}

          <View
            style={{
              position: "absolute",
              left: "33.33%",
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          />
          <View
            style={{
              position: "absolute",
              left: "66.66%",
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: "33.33%",
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: "66.66%",
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          />
        </View>

        <View
          {...handlePanResponders.topLeft.panHandlers}
          style={[styles.resizeHandle, styles.topLeftHandle]}
        />
        <View
          {...handlePanResponders.topRight.panHandlers}
          style={[styles.resizeHandle, styles.topRightHandle]}
        />
        <View
          {...handlePanResponders.bottomLeft.panHandlers}
          style={[styles.resizeHandle, styles.bottomLeftHandle]}
        />
        <View
          {...handlePanResponders.bottomRight.panHandlers}
          style={[styles.resizeHandle, styles.bottomRightHandle]}
        />
      </View>
    </View>
  );
}

type CropViewProps = {
  originalUri: string;
  onDone: (croppedUri: string, cropData: CropData) => void;
  onCancel: () => void;
};

export function CropView({ originalUri, onDone, onCancel }: CropViewProps) {
  const cropRef = useRef<CropZoomRefType>(null);
  const { isFetching, resolution } = useImageResolution({ uri: originalUri });
  const [cropSize, setCropSize] = useState<CropSize>({
    width: DEFAULT_CROP_WIDTH,
    height: DEFAULT_CROP_HEIGHT,
  });
  const cropSizeRef = useRef(cropSize);
  const resizeStartRef = useRef(cropSize);

  useEffect(() => {
    cropSizeRef.current = cropSize;
  }, [cropSize]);

  const clampCropSize = useCallback((nextSize: CropSize): CropSize => {
    return {
      width: clamp(nextSize.width, MIN_CROP_WIDTH, MAX_CROP_WIDTH),
      height: clamp(nextSize.height, MIN_CROP_HEIGHT, MAX_CROP_HEIGHT),
    };
  }, []);

  const beginResize = useCallback(() => {
    resizeStartRef.current = cropSizeRef.current;
  }, []);

  const resizeFromCorner = useCallback(
    (corner: ResizeCorner, dx: number, dy: number) => {
      const startSize = resizeStartRef.current;
      let nextWidth = startSize.width;
      let nextHeight = startSize.height;

      switch (corner) {
        case "topLeft":
          nextWidth = startSize.width - dx * 2;
          nextHeight = startSize.height - dy * 2;
          break;
        case "topRight":
          nextWidth = startSize.width + dx * 2;
          nextHeight = startSize.height - dy * 2;
          break;
        case "bottomLeft":
          nextWidth = startSize.width - dx * 2;
          nextHeight = startSize.height + dy * 2;
          break;
        case "bottomRight":
          nextWidth = startSize.width + dx * 2;
          nextHeight = startSize.height + dy * 2;
          break;
      }

      setCropSize(
        clampCropSize({
          width: nextWidth,
          height: nextHeight,
        }),
      );
    },
    [clampCropSize],
  );

  const createResizeResponder = useCallback(
    (corner: ResizeCorner) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: beginResize,
        onPanResponderMove: (_, gestureState) => {
          resizeFromCorner(corner, gestureState.dx, gestureState.dy);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [beginResize, resizeFromCorner],
  );

  const handlePanResponders = useMemo<ResizeHandleResponders>(
    () => ({
      topLeft: createResizeResponder("topLeft"),
      topRight: createResizeResponder("topRight"),
      bottomLeft: createResizeResponder("bottomLeft"),
      bottomRight: createResizeResponder("bottomRight"),
    }),
    [createResizeResponder],
  );

  const handleCrop = async () => {
    if (!cropRef.current || !resolution) return;

    const cropResult = cropRef.current.crop();
    const cropData: CropData = {
      originX: Math.round(cropResult.crop.originX),
      originY: Math.round(cropResult.crop.originY),
      width: Math.round(cropResult.crop.width),
      height: Math.round(cropResult.crop.height),
    };

    const imageRef = await ImageManipulator.manipulate(originalUri)
      .crop(cropData)
      .renderAsync();

    const saved = await imageRef.saveAsync({
      compress: 1,
      format: SaveFormat.JPEG,
    });

    onDone(saved.uri, cropData);
  };

  if (isFetching || !resolution) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="absolute top-[52px] left-4 z-10">
        <IconButton
          onPress={onCancel}
          icon={
            <StSvg name="Close_round" size={24} color={colors.neutral[900]} />
          }
        />
      </View>

      <CropZoom ref={cropRef} cropSize={cropSize} resolution={resolution}>
        <Image
          source={{ uri: originalUri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </CropZoom>

      <CropOverlay
        cropSize={cropSize}
        handlePanResponders={handlePanResponders}
      />

      <View className="absolute bottom-10 left-4 right-4">
        <Button title="Применить кроп" onPress={handleCrop} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cropFrame: {
    justifyContent: "center",
    alignItems: "center",
  },
  resizeHandle: {
    position: "absolute",
    width: HANDLE_TOUCH_SIZE,
    height: HANDLE_TOUCH_SIZE,
  },
  topLeftHandle: {
    top: -HANDLE_TOUCH_SIZE / 2,
    left: -HANDLE_TOUCH_SIZE / 2,
  },
  topRightHandle: {
    top: -HANDLE_TOUCH_SIZE / 2,
    right: -HANDLE_TOUCH_SIZE / 2,
  },
  bottomLeftHandle: {
    bottom: -HANDLE_TOUCH_SIZE / 2,
    left: -HANDLE_TOUCH_SIZE / 2,
  },
  bottomRightHandle: {
    bottom: -HANDLE_TOUCH_SIZE / 2,
    right: -HANDLE_TOUCH_SIZE / 2,
  },
});
