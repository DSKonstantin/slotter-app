import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import SupportModal from "@/src/components/shared/modals/SupportModal";
import { colors } from "@/src/styles/colors";

type AuthHeaderProps = {
  showBack?: boolean;
  showSupport?: boolean;
  title?: string;
};

export default function AuthHeader({
  showBack = true,
  showSupport = true,
  title,
}: AuthHeaderProps) {
  const router = useRouter();
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
          <Typography weight="bold" className="text-[24px] text-neutral-0">
            {title}
          </Typography>
        ) : (
          <View className="w-10" />
        )}

        {}

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
      </View>
      <SupportModal visible={supportVisible} onClose={closeSupport} />
    </>
  );
}
