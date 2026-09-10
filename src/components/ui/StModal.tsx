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
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { BottomSheetHandle } from "./BottomSheetHandle";
import { IconButton } from "./IconButton";
import { StSvg } from "./StSvg";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { colors } from "@/src/styles/colors";

export type StModalHeaderAction = {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
};

type StModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  headerLeft?: StModalHeaderAction;
  headerRight?: StModalHeaderAction;
  headerCloseButton?: boolean;
  containerClassName?: string;
  horizontalPadding?: boolean;
  keyboardAware?: boolean;
  keyboardAwareBottomOffset?: number;
  fullHeight?: boolean;
  scrollable?: boolean;
  scrollRef?: (ref: ScrollView | null) => void;
  contentRef?: React.Ref<View>;
  dismissible?: boolean;
} & Partial<ModalProps>;

export const StModal = ({
  visible,
  onClose,
  children,
  header,
  footer,
  headerLeft,
  headerRight,
  headerCloseButton = false,
  horizontalPadding = true,
  keyboardAware = false,
  keyboardAwareBottomOffset,
  fullHeight = false,
  scrollable = false,
  scrollRef: externalScrollRef,
  contentRef,
  dismissible = true,
  ...props
}: StModalProps) => {
  const { height } = useWindowDimensions();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const swipeThreshold = height * 0.1;

  const [scrollOffset, setScrollOffset] = useState(0);
  const [scrollOffsetMax, setScrollOffsetMax] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
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
      swipeDirection={dismissible ? "down" : undefined}
      swipeThreshold={swipeThreshold}
      onBackdropPress={dismissible ? onClose : undefined}
      onSwipeComplete={dismissible ? onClose : undefined}
      statusBarTranslucent
      style={[styles.container, { paddingTop: top }]}
      {...swipeAwareProps}
      {...props}
    >
      <View
        className="py-3 relative rounded-t-large bg-background overflow-hidden"
        style={containerStyle}
      >
        {dismissible && <BottomSheetHandle />}

        {headerLeft && (
          <IconButton
            size="sm"
            buttonClassName="bg-transparent absolute left-3 top-1 z-10"
            hitSlop={12}
            onPress={headerLeft.onPress}
            accessibilityLabel={headerLeft.accessibilityLabel}
            icon={headerLeft.icon}
          />
        )}
        {headerCloseButton && (
          <IconButton
            size="sm"
            buttonClassName="bg-transparent absolute right-3 top-1 z-10"
            hitSlop={12}
            onPress={onClose}
            accessibilityLabel="Закрыть"
            icon={
              <StSvg name="Close_round" size={20} color={colors.neutral[900]} />
            }
          />
        )}
        {headerRight && (
          <IconButton
            size="sm"
            buttonClassName="bg-transparent absolute right-3 top-1 z-10"
            hitSlop={12}
            onPress={headerRight.onPress}
            accessibilityLabel={headerRight.accessibilityLabel}
            icon={headerRight.icon}
          />
        )}

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
            style={
              fullHeight
                ? styles.scrollFlex
                : { maxHeight: height - top, flexShrink: 1 }
            }
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

      {visible && <Toasts overrideDarkMode={true} />}
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
