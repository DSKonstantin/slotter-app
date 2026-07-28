import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import SupportModal from "@/src/components/shared/modals/SupportModal";
import { Button, Divider, Item, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useOpenPersonalAccount } from "@/src/hooks/useOpenPersonalAccount";
import { useRunOnNextForeground } from "@/src/hooks/useRunOnNextForeground";
import { useLazyGetMeQuery } from "@/src/store/redux/services/api/authApi";
import { useLazyGetSubscriptionMembershipQuery } from "@/src/store/redux/services/api/subscriptionApi";
import { useRefresh } from "@/src/hooks/useRefresh";
import { useAuth } from "@/src/contexts/AuthContext";
import { toast } from "@backpackapp-io/react-native-toast";
import ProfileAvatar from "@/src/components/app/account/ProfileAvatar";
import { useAppSelector } from "@/src/store/redux/store";

type NavItem = {
  title: string;
  subtitle?: string;
  icon: string;
  rightIcon?: string;
  route: () => void;
};

const AccountScreen = () => {
  const [supportVisible, setSupportVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const auth = useRequiredAuth();
  const [triggerGetMe] = useLazyGetMeQuery();
  const [getSubscriptionMembership] = useLazyGetSubscriptionMembershipQuery();
  const openPersonalAccount = useOpenPersonalAccount();
  const runOnNextForeground = useRunOnNextForeground();
  const ispe = useAppSelector((state) => state.appVersion.ispe);
  const hasProAccess = useAppSelector(
    (state) => state.auth.user?.subscription_membership?.pro_access ?? false,
  );
  const { logout } = useAuth();

  const handleRefresh = async () => {
    try {
      await triggerGetMe().unwrap();
    } catch {
      toast.error("Не удалось обновить данные профиля");
    }
  };

  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  if (!auth) return null;

  const handleUpgrade = () => {
    // в кабинете можно продлить/отменить подписку —
    // на возврате освежить pro_access/membership
    runOnNextForeground(() =>
      getSubscriptionMembership({ userId: auth.userId }),
    );
    openPersonalAccount();
  };

  const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
    {
      label: "Профиль",
      items: [
        {
          title: "Настройки профиля",
          icon: "User_fill",
          route: () => router.push(Routers.app.account.profileSettings),
        },
        {
          title: "Галерея",
          subtitle: "(фото на сайт)",
          icon: "Camera",
          route: () => router.push(Routers.app.account.gallery),
        },
        {
          title: "Контакты",
          icon: "link_alt",
          route: () => router.push(Routers.app.account.contacts),
        },
        {
          title: "Просмотр страницы",
          icon: "Eye_fill",
          route: () => router.push(Routers.app.account.preview),
        },
      ],
    },
    {
      label: "Запись и оплата",
      items: [
        {
          title: "Настройки онлайн-записи",
          icon: "Setting_alt_fill",
          route: () => router.push(Routers.app.account.booking),
        },
        {
          title: "Уведомления клиентам",
          icon: "Message_fill",
          route: () =>
            router.push(Routers.app.account.clientNotifications.root),
        },
      ],
    },
    {
      label: "Система",
      items: [
        {
          title: "Безопасность",
          icon: "Chield_alt_fill",
          route: () => router.push(Routers.app.account.security.root),
        },
        {
          title: "Уведомления",
          icon: "Bell_fill",
          route: () => router.push(Routers.app.account.notifications),
        },
        {
          title: "База знаний",
          icon: "Mortarboard_fill",
          rightIcon: "External",
          route: () =>
            WebBrowser.openBrowserAsync(
              `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/knowledge-base`,
            ),
        },
        {
          title: "Поддержка",
          icon: "Support",
          route: () => {},
        },
      ],
    },
  ];

  return (
    <>
      <ScreenWithToolbar title="Аккаунт" showBack={false}>
        {({ topInset, bottomInset }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentInset={Platform.OS === "ios" ? { top: topInset } : undefined}
            contentOffset={
              Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
            }
            contentContainerStyle={{
              paddingTop: Platform.OS === "ios" ? 0 : topInset,
              paddingBottom: bottomInset + 8,
            }}
            refreshControl={
              <RefreshControl
                progressViewOffset={Platform.select({
                  android: topInset,
                })}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            <ProfileAvatar />

            {ispe && (
              <View className="mx-screen mt-4">
                {hasProAccess ? (
                  <Button
                    title="Личный кабинет"
                    variant="secondary"
                    size="lg"
                    buttonClassName="rounded-full h-[62px]"
                    onPress={handleUpgrade}
                  />
                ) : (
                  <Button
                    title="Обновить до"
                    variant="secondary"
                    size="lg"
                    buttonClassName="rounded-full h-[62px]"
                    buttonProps={{
                      style: {
                        boxShadow:
                          "0px 2px 5px 0px #D6FFA31F, 0px 9px 9px 0px #D6FFA31A, 0px 19px 12px 0px #D6FFA30F, 0px 35px 14px 0px #D6FFA305, 0px 54px 15px 0px #D6FFA300",
                      },
                    }}
                    onPress={handleUpgrade}
                    rightIcon={
                      <View className="flex-row items-center gap-0.5 bg-primary-green-500 rounded-full px-1.5 pr-2 py-0.5">
                        <StSvg
                          name="Star_alt_fill"
                          size={22}
                          color={colors.neutral[900]}
                        />
                        <Typography
                          weight="semibold"
                          className="text-caption text-neutral-900"
                        >
                          PRO
                        </Typography>
                      </View>
                    }
                  />
                )}
              </View>
            )}

            <View className="mx-screen gap-7 mt-7">
              {NAV_SECTIONS.map((section) => (
                <View key={section.label} className="gap-2">
                  <Typography
                    weight="semibold"
                    className="text-body text-neutral-500"
                  >
                    {section.label}
                  </Typography>
                  <View className="bg-background-surface rounded-base overflow-hidden">
                    {section.items.map((item, index) => (
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
                              name={
                                item.rightIcon ? item.rightIcon : "Expand_right"
                              }
                              size={20}
                              color={colors.neutral[400]}
                            />
                          }
                          onPress={
                            item.title === "Поддержка"
                              ? () => setSupportVisible(true)
                              : item.route
                          }
                        />
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <Pressable
              className="flex-row items-center justify-center gap-2 mt-7 py-2 active:opacity-70"
              disabled={isLoggingOut}
              onPress={() =>
                Alert.alert(
                  "Выйти из аккаунта?",
                  "Вы уверены, что хотите выйти?",
                  [
                    { text: "Отмена", style: "cancel" },
                    {
                      text: "Подтвердить",
                      style: "destructive",
                      onPress: async () => {
                        setIsLoggingOut(true);
                        await logout();
                      },
                    },
                  ],
                )
              }
            >
              {isLoggingOut ? (
                <ActivityIndicator
                  size="small"
                  color={colors.accent.red[500]}
                />
              ) : (
                <>
                  <Typography
                    weight="semibold"
                    className="text-body text-accent-red-500"
                  >
                    Выйти
                  </Typography>
                  <StSvg
                    name="Sign_out_squre_fill"
                    size={24}
                    color={colors.accent.red[500]}
                  />
                </>
              )}
            </Pressable>
          </ScrollView>
        )}
      </ScreenWithToolbar>
      <SupportModal
        visible={supportVisible}
        onClose={() => setSupportVisible(false)}
      />
    </>
  );
};

export default AccountScreen;
