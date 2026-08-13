import React, { useState } from "react";
import { View, Pressable, Share } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { toast } from "@backpackapp-io/react-native-toast";
import { Typography, Divider, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { Consent } from "@/src/store/redux/services/api-types";
import { useAppSelector } from "@/src/store/redux/store";

const KIND_LABEL: Record<string, string> = {
  personal_data: "Персональные данные",
  marketing: "Рекламная рассылка",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type Props = {
  userId: number;
  consents: Consent[];
};

export default function ConsentsSection({ userId, consents }: Props) {
  const token = useAppSelector((s) => s.auth.token);
  const [downloading, setDownloading] = useState<number | null>(null);

  if (consents.length === 0) return null;

  const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL!.replace(/\/+$/, "");

  const handleDownload = async (consent: Consent) => {
    if (!token) return;
    setDownloading(consent.id);
    try {
      const url = `${baseURL}/users/${userId}/consents/${consent.id}/download`;
      const fileName = `consent_${consent.kind}_${consent.id}.pdf`;
      const localUri = (FileSystem.cacheDirectory ?? "") + fileName;

      const result = await FileSystem.downloadAsync(url, localUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (result.status !== 200) {
        throw new Error("Ошибка загрузки");
      }

      await Share.share({ url: result.uri });
    } catch {
      toast.error("Не удалось скачать документ");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <View className="mt-6">
      <Typography weight="medium" className="text-caption text-neutral-500 mb-2">
        Согласия
      </Typography>
      <View className="bg-background-surface rounded-base">
        {consents.map((consent, index) => (
          <View key={consent.id}>
            {index > 0 && (
              <View className="px-4">
                <Divider />
              </View>
            )}
            <View className="px-4 py-3 flex-row items-center justify-between gap-3">
              <View className="flex-1 gap-0.5">
                <Typography weight="medium" className="text-body">
                  {KIND_LABEL[consent.kind] ?? consent.kind}
                </Typography>
                <Typography className="text-caption text-neutral-500">
                  {formatDate(consent.created_at)}
                </Typography>
              </View>
              <Pressable
                className="active:opacity-70"
                disabled={downloading === consent.id}
                onPress={() => handleDownload(consent)}
              >
                <StSvg
                  name="Export_fill"
                  size={24}
                  color={
                    downloading === consent.id
                      ? colors.neutral[400]
                      : colors.primary.blue[500]
                  }
                />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
