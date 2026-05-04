import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { router, usePathname, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setTabMenuOpen } from "@/src/store/redux/slices/uiSlice";

type MenuItem = {
  label: string;
  icon: string;
  route?: string;
  disabled?: boolean;
};

const stripRouteGroups = (route: string) => route.replace(/\/\([^)]+\)/g, "");

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
  {
    label: "Финансы",
    icon: "Wallet_fill",
    route: Routers.app.menu.finances.root,
  },
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
  const pathname = usePathname();

  const handleClose = useCallback(() => {
    dispatch(setTabMenuOpen(false));
  }, [dispatch]);

  const handleNavigate = useCallback(
    (route?: string, isActive?: boolean) => {
      handleClose();
      if (!route || isActive) return;
      router.push(route as Href);
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
          bottom: bottom + 8,
          right: rightInset + 20,
        }}
      >
        <IconButton
          size="lg"
          icon={
            <StSvg name="Close_round" size={36} color={colors.neutral[900]} />
          }
          onPress={handleClose}
        />
      </View>

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
          className="bg-white rounded-[30px] py-2.5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {MENU_ITEMS.map((item) => {
            const normalized = item.route ? stripRouteGroups(item.route) : "";
            const isActive = !!(
              normalized &&
              !item.disabled &&
              (pathname === normalized || pathname.startsWith(`${normalized}/`))
            );

            return (
              <Pressable
                key={item.label}
                onPress={() => handleNavigate(item.route, isActive)}
                disabled={item.disabled}
                className={`flex-row items-center gap-3 mx-2.5 px-2 py-3 rounded-[22px] active:opacity-70 ${
                  isActive ? "bg-[#F9F8F9]" : ""
                }`}
              >
                <StSvg name={item.icon} size={24} color={colors.neutral[900]} />
                <Typography
                  weight={isActive ? "semibold" : "medium"}
                  className={`text-body ${
                    item.disabled ? "text-neutral-300" : "text-neutral-900"
                  }`}
                >
                  {item.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default TabMenu;
