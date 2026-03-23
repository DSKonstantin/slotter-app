import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { Service } from "@/src/store/redux/services/api-types";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";

type PreviewServiceCardProps = {
  service: Service;
  categoryName: string;
  width: number;
};

const PreviewServiceCard = ({
  service,
  categoryName,
  width,
}: PreviewServiceCardProps) => {
  return (
    <View
      style={{ width }}
      className="overflow-hidden rounded-[28px] bg-background-surface"
    >
      <View className="relative h-[188px] bg-primary-blue-100">
        {service.main_photo_url ? (
          <Image
            source={{ uri: service.main_photo_url }}
            className="h-full w-full"
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center gap-2">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/70">
              <StSvg name="Camera" size={28} color={colors.primary.blue[500]} />
            </View>
            <Typography className="text-caption text-primary-blue-500">
              Фото услуги
            </Typography>
          </View>
        )}

        <View className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-2">
          <Typography
            weight="semibold"
            className="text-caption uppercase text-neutral-900"
            numberOfLines={1}
          >
            {categoryName}
          </Typography>
        </View>
      </View>

      <View className="gap-4 p-5">
        <View className="gap-1.5">
          <Typography
            weight="semibold"
            className="text-[20px] leading-[24px] text-neutral-900"
            numberOfLines={1}
          >
            {service.name}
          </Typography>

          {service.description ? (
            <Typography
              weight="regular"
              numberOfLines={3}
              className="text-body leading-5 text-neutral-700"
            >
              {service.description}
            </Typography>
          ) : (
            <Typography
              weight="regular"
              className="text-body leading-5 text-neutral-500"
            >
              Подробное описание услуги появится здесь.
            </Typography>
          )}
        </View>

        <View className="flex-row flex-wrap gap-2">
          <View className="flex-row items-center gap-1.5 rounded-full bg-background px-3 py-2">
            <StSvg name="Wallet_fill" size={18} color={colors.neutral[500]} />
            <Typography className="text-caption text-neutral-700">
              {formatRublesFromCents(service.price_cents)}
            </Typography>
          </View>

          <View className="flex-row items-center gap-1.5 rounded-full bg-background px-3 py-2">
            <StSvg name="Time" size={18} color={colors.neutral[500]} />
            <Typography className="text-caption text-neutral-700">
              {service.duration} мин
            </Typography>
          </View>

          {service.is_available_online ? (
            <View className="rounded-full bg-primary-blue-100 px-3 py-2">
              <Typography className="text-caption text-primary-blue-500">
                Онлайн
              </Typography>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default PreviewServiceCard;
