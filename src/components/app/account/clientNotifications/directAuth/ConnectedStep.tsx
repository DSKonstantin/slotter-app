import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { format } from "date-fns";
import { Card, Typography, Divider } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import connectImage from "@/assets/images/app/connect.png";
import type { SubscriptionDirectChannel } from "@/src/store/redux/services/api-types";

type Props = {
  channel?: SubscriptionDirectChannel | null;
};

const ConnectedStep = ({ channel }: Props) => (
  <View className="flex-1 items-center justify-center">
    <Image
      source={connectImage}
      style={{ width: 160, height: 160 }}
      contentFit="contain"
      accessible={false}
    />
    <Typography
      weight="semibold"
      className="text-display text-center mt-5 mb-2"
    >
      Канал подключён
    </Typography>
    <Typography className="text-body text-neutral-500 text-center">
      Уведомления уходят клиентам  от вашего имени
    </Typography>

    {channel && (
      <View className="px-4 w-full mt-6 bg-white rounded-base">
        <Card
          title="Статус"
          className="border-0 px-0"
          titleProps={{
            style: {
              color: colors.neutral[500],
            },
          }}
          right={
            <Typography
              weight="semibold"
              className="text-body"
              style={{ color: colors.primary.green[600] }}
            >
              Активен
            </Typography>
          }
        />
        <Divider />
        <Card
          title="Стоимость"
          className="border-0 px-0"
          titleProps={{
            style: {
              color: colors.neutral[500],
            },
          }}
          right={
            <Typography weight="semibold" className="text-body">
              {formatRublesFromCents(channel.price_cents)}/мес
            </Typography>
          }
        />
        {channel.period_ends_at && (
          <>
            <Divider />
            <Card
              title="Следующее списание"
              className="border-0 px-0"
              titleProps={{
                style: {
                  color: colors.neutral[500],
                },
              }}
              right={
                <Typography weight="semibold" className="text-body">
                  {format(new Date(channel.period_ends_at), "dd.MM.yy")}
                </Typography>
              }
            />
          </>
        )}
      </View>
    )}
  </View>
);

export default ConnectedStep;
