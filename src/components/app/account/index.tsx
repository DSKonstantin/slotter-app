import React, { useState } from "react";
import {
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import SupportModal from "@/src/components/shared/modals/SupportModal";
import { Button, Divider, Item, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useLazyGetMeQuery } from "@/src/store/redux/services/api/authApi";
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
  const auth = useRequiredAuth();
  const { logout } = useAuth();
  const [supportVisible, setSupportVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [triggerGetMe] = useLazyGetMeQuery();

  const handleRefresh = async () => {
    try {
      await triggerGetMe().unwrap();
    } catch {
      toast.error("Не удалось обновить данные профиля");
    }
  };

  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  const token = useAppSelector((state) => state.auth.token);

  if (!auth) return null;

  const NAV_GROUPS: NavItem[][] = [
    [
      {
        title: "Оплата",
        icon: "Credit-card_fill",
        rightIcon: "External",
        route: () =>
          Linking.openURL(
            `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/personal-account/${auth.userId}?token=${token}`,
          ),
      },
    ],
    [
      {
        title: "О специалисте",
        icon: "User_fill",
        route: () => router.push(Routers.app.account.about),
      },
      {
        title: "Галерея",
        subtitle: "(фото на сайт)",
        icon: "Camera",
        route: () => router.push(Routers.app.account.gallery),
      },
      {
        title: "Отзывы",
        icon: "Chat_alt_3_fill",
        route: () => {},
      },
      {
        title: "Ссылки",
        icon: "link_alt",
        route: () => router.push(Routers.app.account.links),
      },
    ],
    [
      {
        title: "Бронирование",
        icon: "Setting_alt_fill",
        route: () => router.push(Routers.app.account.booking),
      },
    ],
    [
      {
        title: "Уведомления клиентам",
        icon: "Message_fill",
        rightIcon: "External",
        route: () => {},
      },
    ],
    [
      {
        title: "Просмотр страницы",
        icon: "Eye_fill",
        route: () => router.push(Routers.app.account.preview),
      },
    ],
    [
      {
        title: "Уведомления",
        icon: "Bell_fill",
        route: () => router.push(Routers.app.account.notifications),
      },
      {
        title: "Поддержка",
        icon: "Chat_alt_2_fill",
        route: () => {},
      },
    ],
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

            <View className="mx-screen gap-7 mt-7">
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
              ))}
            </View>

            <View className="mx-screen mt-7">
              <Button
                title="Выйти"
                variant="clear"
                loading={isLoggingOut}
                disabled={isLoggingOut}
                onPress={async () => {
                  setIsLoggingOut(true);
                  await logout();
                }}
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
      <SupportModal
        visible={supportVisible}
        onClose={() => setSupportVisible(false)}
      />
    </>
  );
};

export default AccountScreen;
