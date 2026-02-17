import React, { useCallback, useRef, useState } from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthFooter from "@/src/components/auth/layout/footer";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { Pressable, Share, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import * as Clipboard from "expo-clipboard";
import { colors } from "@/src/styles/colors";

const Link = () => {
  const link = "slotter.app/ivan_barber";
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(link);

    setCopied(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, [link]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: "slotter.app/ivan_barber",
      });
    } catch (e) {
      console.log("Share error:", e);
    }
  };

  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      footer={
        <AuthFooter
          primary={{
            title: "Поделиться ссылкой",
            onPress: () => {
              handleShare();
            },
          }}
          secondary={{
            title: "Перейти в кабинет",
            variant: "clear",
            onPress: () => {
              router.push(Routers.auth.root);
            },
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

        <Pressable
          onPress={handleCopy}
          className="flex-row justify-center items-center mt-5 bg-background-surface w-full rounded-2xl p-4 border border-dashed border-neutral-500 gap-1.5"
        >
          <Typography className="text-body text-primary-blue-500">
            {copied ? "Скопировано" : link}
          </Typography>
          <StSvg
            name={copied ? "Done_round" : "Copy_alt"}
            size={24}
            color={colors.primary.blue[500]}
          />
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
};

export default Link;
