import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { Routers } from "@/src/constants/routers";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setTabMenuOpen } from "@/src/store/redux/slices/uiSlice";

type MenuItem = {
  label: string;
  icon: string;
  route?: string;
  disabled?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: "График",
    icon: "Date_today",
    route: Routers.app.menu.schedule,
  },
  {
    label: "Уведомления",
    icon: "Bell_fill",
    route: Routers.app.menu.notifications,
  },
  { label: "Финансы", icon: "Wallet_fill", route: Routers.app.menu.finances },
  {
    label: "Услуги",
    icon: "Desk_alt_fill",
    route: Routers.app.menu.services.root,
  },
  {
    label: "Аккаунт",
    icon: "User_circle",
    route: Routers.app.menu.account.root,
  },
  { label: "Акции", icon: "Percent", disabled: true },
];

const TabMenu = () => {
  const dispatch = useAppDispatch();
  const isMenuOpen = useAppSelector((s) => s.ui.isTabMenuOpen);
  const { bottom, left: leftInset, right: rightInset } = useSafeAreaInsets();

  const handleClose = useCallback(() => {
    dispatch(setTabMenuOpen(false));
  }, [dispatch]);

  const handleNavigate = useCallback(
    (route?: string) => {
      if (!route) return;
      handleClose();
      router.push(route as any);
    },
    [handleClose],
  );

  if (!isMenuOpen) return null;

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      <Pressable
        className="absolute inset-0 bg-black/40"
        onPress={handleClose}
      />

      <View
        className="absolute"
        style={{
          bottom,
          left: leftInset + 20,
          right: rightInset + 94,
        }}
      >
        <View className="mb-2 items-end">
          <IconButton
            onPress={() => {}}
            icon={
              <StSvg
                name="Setting_alt_fill"
                size={28}
                color={colors.neutral[900]}
              />
            }
          />
        </View>
        <View
          className="bg-white rounded-[30px] py-2"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => handleNavigate(item.route)}
              disabled={item.disabled}
              className="flex-row items-center gap-3 px-5 py-3 active:opacity-60"
            >
              <StSvg
                name={item.icon as any}
                size={24}
                color={
                  item.disabled ? colors.neutral[300] : colors.neutral[900]
                }
              />
              <Typography
                weight="medium"
                className={`text-body ${item.disabled ? "text-neutral-300" : "text-neutral-900"}`}
              >
                {item.label}
              </Typography>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TabMenu;
