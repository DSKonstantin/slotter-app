import { useCallback, useState } from "react";
import type { LayoutChangeEvent, LayoutRectangle } from "react-native";

export default function useLayout() {
  const [layout, setLayout] = useState<LayoutRectangle>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setLayout(e.nativeEvent.layout);
  }, []);

  return [layout, onLayout] as const;
}
