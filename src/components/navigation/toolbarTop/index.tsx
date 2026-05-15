import React, { useContext } from "react";

import { TextInput, View } from "react-native";
import {
  Button,
  IconButton,
  StSvg,
  Typography,
  FadeOverlay,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { Href } from "expo-router";
import { ToolbarContext } from "@/src/components/shared/layout/toolbarContext";
import { useSafeBack } from "@/src/hooks/useSafeBack";

type ToolbarTopProps = {
  title: string | React.ReactNode;
  showBack?: boolean;
  rightButton?: React.ReactNode;
  fallbackHref?: Href;
};

const ToolbarTop = ({
  title,
  showBack = true,
  rightButton,
  fallbackHref,
}: ToolbarTopProps) => {
  const insets = useSafeAreaInsets();
  const toolbar = useContext(ToolbarContext);
  const safeBack = useSafeBack(fallbackHref);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: insets.top,
        backgroundColor: "transparent",
      }}
    >
      <FadeOverlay position="top" height={TOOLBAR_HEIGHT + insets.top} />
      <View
        className="mx-screen flex-row items-center justify-between gap-2"
        style={{
          height: TOOLBAR_HEIGHT,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        {(toolbar?.searchMode ?? false) ? (
          <>
            <View
              className="flex-1 flex-row items-center rounded-full h-[48px] px-4 bg-background-surface gap-2"
              style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)" }}
            >
              <StSvg name="Search" size={20} color={colors.neutral[500]} />
              <TextInput
                autoFocus
                value={toolbar?.searchValue ?? ""}
                onChangeText={toolbar?.handleSearchChange}
                placeholder={toolbar?.searchPlaceholder ?? "Поиск..."}
                placeholderTextColor={colors.neutral[400]}
                returnKeyType="search"
                className="flex-1 font-inter-regular text-[15px] text-neutral-900"
              />
              {toolbar?.searchValue !== "" && (
                <IconButton
                  size="xs"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  icon={
                    <StSvg
                      name="Close_round"
                      size={20}
                      color={colors.neutral[500]}
                    />
                  }
                  onPress={() => toolbar?.handleSearchChange("")}
                />
              )}
            </View>
            <Button
              title="Отмена"
              variant="clear"
              buttonClassName="p-0 rounded-none"
              textClassName="text-[13px]"
              onPress={() => {
                toolbar?.handleSearchClose();
              }}
            />
          </>
        ) : (
          <>
            {showBack ? (
              <IconButton
                style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)" }}
                icon={
                  <StSvg
                    name="Arrow_left"
                    size={24}
                    color={colors.neutral[900]}
                  />
                }
                onPress={safeBack}
              />
            ) : (
              <View className="w-[48px]" />
            )}

            <View className="flex-1 items-center justify-center">
              <View
                className="rounded-full h-[48px] px-4 items-center justify-center bg-background-surface max-w-[100%]"
                style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)" }}
              >
                {typeof title === "string" ? (
                  <Typography
                    weight="semibold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="text-[17px] leading-[22px]"
                  >
                    {title}
                  </Typography>
                ) : (
                  title
                )}
              </View>
            </View>

            {rightButton ? (
              <View
                className="rounded-full"
                style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)" }}
              >
                {rightButton}
              </View>
            ) : (
              <View className="w-[48px]" />
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default ToolbarTop;
