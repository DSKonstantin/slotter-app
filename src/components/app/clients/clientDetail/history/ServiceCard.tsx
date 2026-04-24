import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { Badge, IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  service: {
    main_photo_url?: string;
    name: string;
  };
};

const ServiceCard = ({ service }: Props) => {
  return (
    <View className="flex-1">
      <View className="relative h-[187px] bg-neutral-500 rounded-base overflow-hidden">
        <Image
          source={
            service.main_photo_url
              ? { uri: service.main_photo_url }
              : require("@/assets/images/placeholders/placeholder-slotter.png")
          }
          style={{ width: "100%", height: "100%", borderRadius: 20 }}
          contentFit="cover"
        />
        <View className="absolute top-2 right-2">
          <Badge
            title="29.08"
            size="sm"
            icon={
              <StSvg
                name="Book_check_fill"
                size={16}
                color={colors.neutral[0]}
              />
            }
          />
        </View>
      </View>

      <View className="flex-row justify-between mt-2">
        <Typography
          weight="semibold"
          className="flex-1 text-body text-neutral-900 mr-1"
          numberOfLines={2}
        >
          {service.name}
        </Typography>
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
  );
};

export default ServiceCard;
