import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { Routers } from "@/src/constants/routers";
import { useAppDispatch } from "@/src/store/redux/store";
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
    icon: "Date_range_fill",
    route: Routers.app.menu.schedule,
  },
  {
    label: "Уведомления",
    icon: "Notification",
    route: Routers.app.menu.notifications,
  },
  { label: "Клиенты", icon: "Group_fill", route: Routers.app.clients },
  { label: "Финансы", icon: "Wallet", route: Routers.app.menu.finances },
  { label: "Услуги", icon: "Bag_fill", route: Routers.app.menu.services.root },
  {
    label: "Аккаунт",
    icon: "Account_circle_fill",
    route: Routers.app.menu.account,
  },
  { label: "Акции", icon: "Percent", disabled: true },
];

const TabMenu = () => {
  const dispatch = useAppDispatch();
  const { bottom } = useSafeAreaInsets();

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

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      <Pressable
        className="absolute inset-0"
        onPress={handleClose}
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      />

      <View
        className="absolute right-5 bg-white rounded-base py-2 shadow-md"
        style={{
          bottom: TAB_BAR_HEIGHT + bottom + 12,
          minWidth: 210,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="absolute top-2 right-2">
          <IconButton
            size="sm"
            icon={
              <StSvg name="Settings" size={20} color={colors.neutral[900]} />
            }
            onPress={() => handleNavigate(Routers.app.menu.account)}
          />
        </View>

        <View className="pt-2">
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

      <View className="absolute right-5" style={{ bottom: bottom + 2 }}>
        <IconButton
          size="lg"
          icon={<StSvg name="Close" size={28} color={colors.neutral[900]} />}
          onPress={handleClose}
        />
      </View>
    </View>
  );
};

export default TabMenu;
