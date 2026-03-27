import React, { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Item,
  StSvg,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector, useAppDispatch } from "@/src/store/redux/store";
import { logout } from "@/src/store/redux/slices/authSlice";

type NavItem = {
  title: string;
  subtitle?: string;
  icon: string;
  route: () => void;
};

const NAV_GROUPS: NavItem[][] = [
  [
    {
      title: "О специалисте",
      icon: "User_fill",
      route: () => router.push(Routers.app.menu.account.about),
    },
    {
      title: "Галерея",
      subtitle: "( фото на сайт )",
      icon: "Camera",
      route: () => router.push(Routers.app.menu.account.gallery),
    },
    {
      title: "Ссылки",
      icon: "link_alt",
      route: () => router.push(Routers.app.menu.account.links),
    },
  ],
  [
    {
      title: "Просмотр страницы",
      icon: "Eye_fill",
      route: () => router.push(Routers.app.menu.account.preview),
    },
  ],
  [
    {
      title: "Бронирование",
      icon: "Setting_alt_fill",
      route: () => router.push(Routers.app.menu.account.booking),
    },
  ],
  [
    {
      title: "Уведомления",
      icon: "Bell_fill",
      route: () => router.push(Routers.app.menu.account.notifications),
    },
    {
      title: "Поддержка",
      icon: "Chat_alt_2_fill",
      route: () => router.push(Routers.app.menu.account.support),
    },
  ],
];

const AccountScreen = () => {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(() => {
    dispatch(logout());
    router.replace(Routers.auth.root);
  }, [dispatch]);

  if (!auth) return null;

  return (
    <ScreenWithToolbar title="Аккаунт">
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 16,
          }}
        >
          <Card
            title={[user?.first_name, user?.last_name]
              .filter(Boolean)
              .join(" ")}
            subtitle={user?.profession ?? ""}
            left={
              <Avatar
                uri={user?.avatar_url ?? undefined}
                name={[user?.first_name, user?.last_name]
                  .filter(Boolean)
                  .join(" ")}
                size="md"
              />
            }
            className="mx-screen mb-7"
            right={
              <StSvg
                name="Expand_right"
                size={20}
                color={colors.neutral[400]}
              />
            }
            onPress={() =>
              router.push(Routers.app.menu.account.personalInformation)
            }
          />

          <View className="mx-screen gap-7">
            {NAV_GROUPS.map((group, groupIndex) => (
              <View
                key={groupIndex}
                className="bg-background-surface rounded-base overflow-hidden"
              >
                {group.map((item, index) => (
                  <React.Fragment key={item.title}>
                    {index > 0 && (
                      <Divider className="ml-12 mr-4 flex-1 w-auto" />
                    )}
                    <Item
                      title={item.title}
                      subtitle={item.subtitle}
                      left={
                        <StSvg
                          name={item.icon}
                          size={24}
                          color={colors.neutral[900]}
                        />
                      }
                      className="border-0 rounded-none"
                      right={
                        <StSvg
                          name="Expand_right"
                          size={20}
                          color={colors.neutral[400]}
                        />
                      }
                      onPress={item.route}
                    />
                  </React.Fragment>
                ))}
              </View>
            ))}
          </View>

          <View className="mx-screen mt-7">
            <Button
              title="Выйти"
              variant="clear"
              onPress={handleLogout}
              textClassName="text-accent-red-500"
              rightIcon={
                <StSvg
                  name="Sign_out_squre_fill"
                  size={24}
                  color={colors.accent.red[500]}
                />
              }
            />
          </View>
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default AccountScreen;
