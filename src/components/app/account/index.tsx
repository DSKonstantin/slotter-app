import React, { useState } from "react";
import {
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import SupportModal from "@/src/components/shared/modals/SupportModal";
import { Button, Divider, Item, StSvg, Switch } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useLazyGetMeQuery } from "@/src/store/redux/services/api/authApi";
import { useGetCustomerQuery } from "@/src/store/redux/services/api/usersApi";
import { useRefresh } from "@/src/hooks/useRefresh";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAppSelector } from "@/src/store/redux/store";
import { toast } from "@backpackapp-io/react-native-toast";
import ProfileAvatar from "@/src/components/app/account/ProfileAvatar";

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const date = new Date(value);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const AccountScreen = () => {
  const { logout } = useAuth();
  const user = useAppSelector((s) => s.auth.user);
  const [supportVisible, setSupportVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(user?.is_notify_push ?? true);
  const [emailEnabled, setEmailEnabled] = useState(
    user?.is_notify_email ?? false,
  );
  const [telegramEnabled, setTelegramEnabled] = useState(
    user?.is_notify_telegram ?? true,
  );

  const [triggerGetMe] = useLazyGetMeQuery();
  const { refetch: refetchCustomer } = useGetCustomerQuery(user?.id!, { skip: !user?.id });

  const handleRefresh = async () => {
    try {
      await Promise.all([
        triggerGetMe().unwrap(),
        refetchCustomer(),
      ]);
    } catch {
      toast.error("Не удалось обновить данные профиля");
    }
  };

  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  return (
    <>
      <ScreenWithToolbar title="Профиль">
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
                progressViewOffset={Platform.select({ android: topInset })}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            <ProfileAvatar />

            <View className="mx-screen gap-3 mt-7">
              <View className="bg-background-surface rounded-base overflow-hidden">
                <Item
                  title={user?.phone ?? "—"}
                  left={
                    <StSvg
                      name="Phone_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  className="border-0 rounded-none"
                />
                <Divider className="ml-12 mr-4 flex-1 w-auto" />
                <Item
                  title={user?.email ?? "—"}
                  left={
                    <StSvg
                      name="Message_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  className="border-0 rounded-none"
                />
                <Divider className="ml-12 mr-4 flex-1 w-auto" />
                <Item
                  title={formatDate(user?.birthday)}
                  left={
                    <StSvg
                      name="Calendar_fill"
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
                  onPress={() => router.push(Routers.app.account.birthday)}
                />
              </View>

              <View className="bg-background-surface rounded-base overflow-hidden">
                <Item
                  title="Push-уведомления"
                  left={
                    <StSvg
                      name="Bell_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  className="border-0 rounded-none"
                  right={
                    <Switch value={pushEnabled} onChange={setPushEnabled} />
                  }
                />
                <Divider className="ml-12 mr-4 flex-1 w-auto" />
                <Item
                  title="Email-уведомления"
                  left={
                    <StSvg
                      name="Message_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  className="border-0 rounded-none"
                  right={
                    <Switch value={emailEnabled} onChange={setEmailEnabled} />
                  }
                />
                <Divider className="ml-12 mr-4 flex-1 w-auto" />
                <Item
                  title="Уведомления в Telegram Bot"
                  left={
                    <StSvg
                      name="SocialTelegram"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  className="border-0 rounded-none"
                  right={
                    <Switch
                      value={telegramEnabled}
                      onChange={setTelegramEnabled}
                    />
                  }
                />
              </View>

              <View className="bg-background-surface rounded-base overflow-hidden">
                <Item
                  title="Способы оплаты"
                  disabled
                  left={
                    <StSvg
                      name="Credit-card_fill"
                      size={24}
                      color={colors.neutral[400]}
                    />
                  }
                  className="border-0 rounded-none"
                  titleClassName="text-neutral-400"
                  right={
                    <StSvg
                      name="Expand_right"
                      size={20}
                      color={colors.neutral[300]}
                    />
                  }
                />
                <Divider className="ml-12 mr-4 flex-1 w-auto" />
                <Item
                  title="Безопасность"
                  left={
                    <StSvg
                      name="Chield_alt_fill"
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
                  onPress={() => router.push(Routers.app.account.security.root)}
                />
                <Divider className="ml-12 mr-4 flex-1 w-auto" />
                <Item
                  title="Приватность"
                  left={
                    <StSvg
                      name="View_hide_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  className="border-0 rounded-none"
                  right={
                    <StSvg
                      name="External"
                      size={20}
                      color={colors.neutral[400]}
                    />
                  }
                  onPress={() =>
                    WebBrowser.openBrowserAsync("https://slotter.app/privacy")
                  }
                />
              </View>

              <View className="bg-background-surface rounded-base overflow-hidden">
                <Item
                  title="Справка"
                  left={
                    <StSvg
                      name="Info_alt_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  className="border-0 rounded-none"
                  right={
                    <StSvg
                      name="External"
                      size={20}
                      color={colors.neutral[400]}
                    />
                  }
                  onPress={() =>
                    WebBrowser.openBrowserAsync("https://slotter.app/help")
                  }
                />
                <Divider className="ml-12 mr-4 flex-1 w-auto" />
                <Item
                  title="Связаться с нами"
                  left={
                    <StSvg
                      name="Chat_alt_2_fill"
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
                  onPress={() => setSupportVisible(true)}
                />
                <Divider className="ml-12 mr-4 flex-1 w-auto" />
                <Item
                  title="Оценить Slotter"
                  left={
                    <StSvg
                      name="Star_fill"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  className="border-0 rounded-none"
                  right={
                    <StSvg
                      name="External"
                      size={20}
                      color={colors.neutral[400]}
                    />
                  }
                  onPress={() =>
                    Linking.openURL(
                      Platform.OS === "ios"
                        ? "https://apps.apple.com/app/id0000000000"
                        : "https://play.google.com/store/apps/details?id=app.slotter",
                    )
                  }
                />
              </View>
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
