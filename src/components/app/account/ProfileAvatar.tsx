import React, { useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
import { Avatar, StSvg, Typography } from "@/src/components/ui";
import { router, useFocusEffect } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useSubscriptionQuota } from "@/src/hooks/useSubscriptionQuota";
import { useAppSelector } from "@/src/store/redux/store";
import { safeRefetch } from "@/src/utils/safeRefetch";
import { colors } from "@/src/styles/colors";

const ProfileAvatar = () => {
  const user = useAppSelector((s) => s.auth.user);
  const ispe = useAppSelector((s) => s.appVersion.ispe);
  const hasProAccess = user?.subscription_membership?.pro_access ?? false;
  const {
    quota,
    shouldFetchQuota,
    refetch: refetchQuota,
  } = useSubscriptionQuota();

  const planLabel = useMemo(
    () =>
      quota
        ? `Старт ${Math.min(quota.used, quota.limit)}/${quota.limit} записей`
        : "Старт",
    [quota],
  );

  useFocusEffect(
    useCallback(() => {
      if (shouldFetchQuota) safeRefetch(refetchQuota);
    }, [shouldFetchQuota, refetchQuota]),
  );

  return (
    <View className="items-center justify-center pt-4">
      <Pressable
        onPress={() => {
          router.push(Routers.app.account.personalInformation);
        }}
        className="active:opacity-70 justify-center items-center gap-4"
      >
        <View className={ispe && !hasProAccess ? "relative mb-3" : "relative"}>
          <Avatar
            uri={user?.avatar_url ?? undefined}
            name={[user?.first_name, user?.last_name].filter(Boolean).join(" ")}
            size="xl"
          />

          {ispe && (
            <>
              {hasProAccess ? (
                <View className="absolute -bottom-2 left-1">
                  <View className="flex-row items-center gap-0.5 bg-primary-green-500 rounded-full px-2 py-0.5 border-[3px] border-background">
                    <StSvg
                      name="Star_alt_fill"
                      size={16}
                      color={colors.neutral[900]}
                    />
                    <Typography
                      weight="semibold"
                      className="text-caption text-neutral-900"
                    >
                      PRO
                    </Typography>
                  </View>
                </View>
              ) : (
                <View className="absolute -bottom-4 -left-24 -right-24 items-center">
                  <View className="bg-neutral-100 rounded-full px-2.5 py-0.5 border-[3px] border-background">
                    <Typography
                      weight="semibold"
                      numberOfLines={1}
                      className="text-caption text-neutral-900"
                    >
                      {planLabel}
                    </Typography>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        <View className="gap-1">
          <View className="flex-row gap-1 items-center justify-center">
            <Typography weight="semibold" className="text-display text-center">
              {[user?.first_name, user?.last_name].filter(Boolean).join(" ")}
            </Typography>
            <StSvg
              name="Expand_right_light"
              size={24}
              color={colors.neutral[500]}
            />
          </View>

          <Typography className="text-caption text-neutral-500 text-center">
            {[user?.nickname ? `${user.nickname}` : null, user?.profession]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
        </View>
      </Pressable>
    </View>
  );
};

export default ProfileAvatar;
