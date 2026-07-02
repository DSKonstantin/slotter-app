import React, { useCallback, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, IconButton, StSvg } from "@/src/components/ui";
import SupportModal from "@/src/components/shared/modals/SupportModal";
import { colors } from "@/src/styles/colors";
import { useAuth } from "@/src/contexts/AuthContext";

type AuthHeaderProps = {
  showBack?: boolean;
  showSupport?: boolean;
  showLogout?: boolean;
  title?: React.ReactNode;
};

export default function AuthHeader({
  showBack = true,
  showSupport = true,
  showLogout = false,
  title,
}: AuthHeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [supportVisible, setSupportVisible] = useState(false);

  const shouldShowBack = useMemo(
    () => showBack && router.canGoBack(),
    [showBack, router],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const openSupport = useCallback(() => {
    setSupportVisible(true);
  }, []);

  const closeSupport = useCallback(() => {
    setSupportVisible(false);
  }, []);

  return (
    <>
      <View className="flex-row items-center justify-between py-1">
        {showBack && shouldShowBack ? (
          <IconButton
            icon={
              <StSvg name="Expand_left" size={24} color={colors.neutral[900]} />
            }
            onPress={handleBack}
          />
        ) : title ? (
          title
        ) : (
          <View className="w-10" />
        )}

        <View className="flex-row items-center gap-2">
          {showSupport ? (
            <IconButton
              icon={
                <StSvg
                  name="Headphones_fill"
                  size={24}
                  color={colors.neutral[900]}
                />
              }
              onPress={openSupport}
            />
          ) : (
            <View className="w-10" />
          )}

          {showLogout && (
            <Button
              title="Выйти"
              variant="clear"
              buttonClassName="border border-neutral-200"
              buttonProps={{
                style: {
                  borderRadius: 16,
                },
              }}
              onPress={() =>
                Alert.alert("Выйти из аккаунта?", undefined, [
                  { text: "Отмена", style: "cancel" },
                  { text: "Выйти", style: "destructive", onPress: logout },
                ])
              }
            />
          )}
        </View>
      </View>
      <SupportModal visible={supportVisible} onClose={closeSupport} />
    </>
  );
}
