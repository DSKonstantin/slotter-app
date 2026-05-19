import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal, { ModalProps } from "react-native-modal";
import { BlurView } from "expo-blur";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { BottomSheetHandle } from "./BottomSheetHandle";
import {SCREEN_PADDING} from "@/src/constants/layout";

type StModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  containerClassName?: string;
  horizontalPadding?: boolean;
  keyboardAware?: boolean;
  keyboardAwareBottomOffset?: number;
  fullHeight?: boolean;
  scrollable?: boolean;
  scrollRef?: (ref: ScrollView | null) => void;
  contentRef?: React.Ref<View>;
} & Partial<ModalProps>;

export const StModal = ({
  visible,
  onClose,
  children,
  header,
  footer,
  horizontalPadding = true,
  keyboardAware = false,
  keyboardAwareBottomOffset,
  fullHeight = false,
  scrollable = false,
  scrollRef: externalScrollRef,
  contentRef,
  ...props
}: StModalProps) => {
  const { height } = useWindowDimensions();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const swipeThreshold = height * 0.1;

  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [scrollOffsetMax, setScrollOffsetMax] = useState(0);
  const layoutHeightRef = useRef(0);

  const containerStyle = useMemo(
    () => ({
      ...(fullHeight ? { height: height - top } : { maxHeight: height - top }),
      paddingBottom: bottom + 8,
      ...(horizontalPadding && {
        paddingLeft: SCREEN_PADDING + left,
        paddingRight: SCREEN_PADDING + right,
      }),
    }),
    [bottom, fullHeight, height, horizontalPadding, left, right, top],
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollOffset(e.nativeEvent.contentOffset.y);
    },
    [],
  );

  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    setScrollOffsetMax(Math.max(0, h - layoutHeightRef.current));
  }, []);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    layoutHeightRef.current = e.nativeEvent.layout.height;
    setScrollOffsetMax((prev) => Math.max(0, prev));
  }, []);

  const scrollTo = useCallback(
    (p: { x?: number; y?: number; animated?: boolean }) => {
      scrollViewRef.current?.scrollTo(p);
    },
    [],
  );

  const swipeAwareProps = scrollable
    ? {
        scrollTo,
        scrollOffset,
        scrollOffsetMax,
        propagateSwipe: true,
      }
    : { propagateSwipe: true };

  return (
    <Modal
      isVisible={visible}
      swipeDirection={"down"}
      swipeThreshold={swipeThreshold}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      statusBarTranslucent
      style={[styles.container, { paddingTop: top }]}
      {...swipeAwareProps}
      {...props}
    >
      <View
        className="py-3 relative rounded-t-large bg-background overflow-hidden"
        style={containerStyle}
      >
        <BottomSheetHandle />

        {header}

        {keyboardAware ? (
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bottomOffset={keyboardAwareBottomOffset}
          >
            {children}
          </KeyboardAwareScrollView>
        ) : scrollable ? (
          <ScrollView
            ref={(node) => {
              scrollViewRef.current = node;
              externalScrollRef?.(node);
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
            onLayout={handleLayout}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.scrollFlex}
          >
            <View ref={contentRef} collapsable={false}>
              {children}
            </View>
          </ScrollView>
        ) : (
          children
        )}

        {footer}
      </View>
      <Toasts overrideDarkMode={true} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 0,
    justifyContent: "flex-end",
  },
  scrollFlex: {
    flex: 1,
  },
});
