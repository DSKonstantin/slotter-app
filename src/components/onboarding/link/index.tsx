import React, { useCallback } from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthFooter from "@/src/components/auth/layout/footer";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { Share, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { CopyLinkButton } from "@/src/components/shared/copyLinkButton";

const Link = () => {
  const auth = useRequiredAuth();
  const personalLink = useAppSelector((s) => s.auth.user?.nickname);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const link = `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${personalLink ?? ""}`;
  const displayLink = `${process.env.EXPO_PUBLIC_BOOKING_DISPLAY_URL}/${personalLink ?? ""}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: link,
      });
    } catch (e) {
      console.log("Share error:", e);
    }
  };

  const handleCompleteOnboarding = useCallback(async () => {
    if (!auth) return;

    try {
      await updateUser({
        id: auth.userId,
        data: {
          onboarding_step: "completed",
        },
      }).unwrap();

      router.replace(Routers.auth.root);
    } catch (e) {
      console.log("Update user error:", e);
    }
  }, [updateUser, auth]);

  if (!auth) return null;

  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      footer={
        <AuthFooter
          primary={{
            title: "Поделиться ссылкой",
            onPress: handleShare,
          }}
          secondary={{
            title: "Перейти в кабинет",
            variant: "clear",
            loading: isLoading,
            onPress: handleCompleteOnboarding,
          }}
        />
      }
    >
      <View className="flex-1 justify-center items-center mb-14">
        <View className="items-center mb-3">
          <StSvg name="Check_fill" size={60} color={colors.neutral[900]} />
        </View>
        <Typography weight="semibold" className="text-display text-center">
          Всё готово!
        </Typography>
        <Typography className="text-body text-center text-neutral-500 mt-2">
          Твоя ссылка для записи создана
        </Typography>

        <View className="mt-5 w-full">
          <CopyLinkButton link={link} displayLink={displayLink} />
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default Link;
