import React, { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { Canvas, Path, Skia, Line, vec } from "@shopify/react-native-skia";
import { CROP_SIZE } from "./constants";

const CORNER_SIZE = 20;
const CORNER_THICKNESS = 3;

export function CropOverlay() {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { width: cropW, height: cropH } = CROP_SIZE;

  const cropX = (screenW - cropW) / 2;
  const cropY = (screenH - cropH) / 2;

  const overlayPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRect(Skia.XYWHRect(0, 0, screenW, screenH));
    p.addRect(Skia.XYWHRect(cropX, cropY, cropW, cropH));
    return p;
  }, [screenW, screenH, cropX, cropY, cropW, cropH]);

  const borderPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRect(Skia.XYWHRect(cropX, cropY, cropW, cropH));
    return p;
  }, [cropX, cropY, cropW, cropH]);

  const g1x = cropX + cropW / 3;
  const g2x = cropX + (cropW * 2) / 3;
  const g1y = cropY + cropH / 3;
  const g2y = cropY + (cropH * 2) / 3;

  const corners = [
    {
      h: [vec(cropX, cropY), vec(cropX + CORNER_SIZE, cropY)],
      v: [vec(cropX, cropY), vec(cropX, cropY + CORNER_SIZE)],
    },
    {
      h: [vec(cropX + cropW - CORNER_SIZE, cropY), vec(cropX + cropW, cropY)],
      v: [vec(cropX + cropW, cropY), vec(cropX + cropW, cropY + CORNER_SIZE)],
    },
    {
      h: [vec(cropX, cropY + cropH), vec(cropX + CORNER_SIZE, cropY + cropH)],
      v: [vec(cropX, cropY + cropH - CORNER_SIZE), vec(cropX, cropY + cropH)],
    },
    {
      h: [
        vec(cropX + cropW - CORNER_SIZE, cropY + cropH),
        vec(cropX + cropW, cropY + cropH),
      ],
      v: [
        vec(cropX + cropW, cropY + cropH - CORNER_SIZE),
        vec(cropX + cropW, cropY + cropH),
      ],
    },
  ];

  return (
    <Canvas style={{ width: screenW, height: screenH }} pointerEvents="none">
      <Path path={overlayPath} color="rgba(0,0,0,0.5)" fillType="evenOdd" />

      <Path
        path={borderPath}
        color="rgba(255,255,255,0.8)"
        style="stroke"
        strokeWidth={1}
      />

      <Line
        p1={vec(g1x, cropY)}
        p2={vec(g1x, cropY + cropH)}
        color="rgba(255,255,255,0.3)"
        strokeWidth={1}
      />
      <Line
        p1={vec(g2x, cropY)}
        p2={vec(g2x, cropY + cropH)}
        color="rgba(255,255,255,0.3)"
        strokeWidth={1}
      />
      <Line
        p1={vec(cropX, g1y)}
        p2={vec(cropX + cropW, g1y)}
        color="rgba(255,255,255,0.3)"
        strokeWidth={1}
      />
      <Line
        p1={vec(cropX, g2y)}
        p2={vec(cropX + cropW, g2y)}
        color="rgba(255,255,255,0.3)"
        strokeWidth={1}
      />

      {corners.map((corner, i) => (
        <React.Fragment key={i}>
          <Line
            p1={corner.h[0]}
            p2={corner.h[1]}
            color="#fff"
            strokeWidth={CORNER_THICKNESS}
          />
          <Line
            p1={corner.v[0]}
            p2={corner.v[1]}
            color="#fff"
            strokeWidth={CORNER_THICKNESS}
          />
        </React.Fragment>
      ))}
    </Canvas>
  );
}
