import React, { useState } from "react";
import { View, Pressable, Share } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { toast } from "@backpackapp-io/react-native-toast";
import Svg, { Path, Rect } from "react-native-svg";
import { Typography, Divider, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type {
  Consent,
  ConsentKind,
} from "@/src/store/redux/services/api-types";
import { useAppSelector } from "@/src/store/redux/store";

function DownloadIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v13M7 12l5 5 5-5"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={4} y={20} width={16} height={2.5} rx={1.25} fill={color} />
    </Svg>
  );
}

const KIND_LABEL: Record<ConsentKind, string> = {
  personal_data: "Согласие на обработку персональных данных",
  marketing: "Согласие на получение рассылки",
};

const KIND_FILE_PREFIX: Record<ConsentKind, string> = {
  personal_data: "Согласие",
  marketing: "Рассылка",
};

function formatSignedDate(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("ru-RU", { day: "numeric" });
  const month = date.toLocaleDateString("ru-RU", { month: "long" });
  return `Подписано ${day} ${month}`;
}

function getLastName(fullName: string) {
  const parts = fullName.trim().split(" ");
  return parts[parts.length > 1 ? 1 : 0] ?? fullName;
}

type ConsentRowProps = {
  consent: Consent;
  fileName: string;
  userId: number;
};

function ConsentRow({ consent, fileName, userId }: ConsentRowProps) {
  const token = useAppSelector((s) => s.auth.token);
  const [downloading, setDownloading] = useState(false);

  const isOutdated = !consent.is_current && !consent.revoked_at;
  const isRevoked = !!consent.revoked_at;
  const dimmed = isOutdated || isRevoked;

  const handleDownload = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL!.replace(/\/+$/, "");
      const url = `${baseURL}/users/${userId}/consents/${consent.id}/download`;
      const localUri = (FileSystem.cacheDirectory ?? "") + fileName;
      const result = await FileSystem.downloadAsync(url, localUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (result.status !== 200) throw new Error("Ошибка загрузки");
      await Share.share({ url: result.uri });
    } catch {
      toast.error("Не удалось скачать документ");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View
      className={`flex-row items-center gap-3 ${dimmed ? "opacity-50" : ""}`}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: colors.primary.green[100] }}
      >
        <StSvg
          name="File_dock_fill"
          size={24}
          color={colors.primary.green[600]}
        />
      </View>

      <View className="flex-1 gap-0.5">
        <Typography weight="medium" className="text-body" numberOfLines={1}>
          {fileName}
        </Typography>
        <Typography className="text-caption text-neutral-500">
          {formatSignedDate(consent.created_at)}
        </Typography>
        {(isRevoked || isOutdated) && (
          <Typography className="text-caption text-accent-red-500">
            Согласие устарело
          </Typography>
        )}
      </View>

      <Pressable
        className="w-9 h-9 rounded-full items-center justify-center active:opacity-70"
        style={{ backgroundColor: colors.neutral[100] }}
        disabled={downloading}
        onPress={handleDownload}
      >
        <DownloadIcon
          color={downloading ? colors.neutral[400] : colors.neutral[900]}
        />
      </Pressable>
    </View>
  );
}

function UnsignedConsentRow() {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className="w-12 h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: colors.accent.red[100] }}
      >
        <StSvg name="close_ring_fill" size={24} color={colors.accent.red[500]} />
      </View>
      <View className="flex-1 gap-0.5">
        <Typography weight="medium" className="text-body">
          Документ недоступен
        </Typography>
        <Typography className="text-caption text-accent-red-500">
          Согласие не подтверждено
        </Typography>
      </View>
    </View>
  );
}

type Props = {
  userId: number;
  consents: Consent[];
  customerName?: string;
  enabledKinds?: ConsentKind[];
};

const KIND_ORDER: ConsentKind[] = ["personal_data", "marketing"];

export default function ConsentsSection({
  userId,
  consents,
  customerName,
  enabledKinds = [],
}: Props) {
  const allKinds = KIND_ORDER.filter(
    (k) => consents.some((c) => c.kind === k) || enabledKinds.includes(k),
  );

  if (allKinds.length === 0) return null;

  const grouped = allKinds.map((kind) => {
    const sorted = [...consents.filter((c) => c.kind === kind)].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const withVersion = sorted.map((consent, index) => ({
      consent,
      version: index + 1,
    }));
    return { kind, items: withVersion.reverse(), unsigned: sorted.length === 0 };
  });

  const lastName = customerName ? getLastName(customerName) : "";

  return (
    <View className="gap-4 mt-4">
      {customerName && (
        <Typography weight="semibold" className="text-title">
          {customerName}
        </Typography>
      )}

      {grouped.map(({ kind, items, unsigned }) => (
        <View
          key={kind}
          className="bg-background-surface rounded-2xl p-4 gap-3"
        >
          <Typography weight="medium" className="text-body">
            {KIND_LABEL[kind]}
          </Typography>
          <Divider />
          {unsigned ? (
            <UnsignedConsentRow />
          ) : (
            items.map(({ consent, version }) => {
              const prefix = KIND_FILE_PREFIX[kind];
              const fileName = lastName
                ? `${prefix}_${lastName}_v${version}.pdf`
                : `consent_${kind}_${consent.id}.pdf`;
              return (
                <ConsentRow
                  key={consent.id}
                  consent={consent}
                  fileName={fileName}
                  userId={userId}
                />
              );
            })
          )}
        </View>
      ))}
    </View>
  );
}
