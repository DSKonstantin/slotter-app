import React from "react";
import { View } from "react-native";
import { IconButton, StImage, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { Service } from "@/src/store/redux/services/api-types";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";

type PreviewServiceCardProps = {
  service: Service;
};

const PreviewServiceCard = ({ service }: PreviewServiceCardProps) => {
  return (
    <View className="overflow-hidden w-[187px]">
      <StImage
        uri={service.main_photo_url ?? ""}
        style={{
          width: 187,
          height: 187,
          borderRadius: 20,
        }}
      />

      <View className="mt-2">
        <Typography
          weight="semibold"
          className="text-body text-neutral-900"
          numberOfLines={1}
        >
          {service.name}
        </Typography>

        <View className="flex-row justify-between mt-2">
          <View className="gap-1">
            <View className="flex-row gap-1 items-center">
              <StSvg name="Time_fill" size={16} color={colors.neutral[500]} />
              <Typography className="text-caption text-neutral-500">
                {service.duration} мин
              </Typography>
            </View>

            <Typography className="text-caption text-neutral-900">
              от {formatRublesFromCents(service.price_cents)}
            </Typography>
          </View>

          <IconButton
            size="sm"
            buttonClassName="bg-primary"
            icon={
              <StSvg name="Expand_right" size={24} color={colors.neutral[0]} />
            }
            onPress={() => {}}
          />
        </View>
      </View>
    </View>
  );
};

export default PreviewServiceCard;
