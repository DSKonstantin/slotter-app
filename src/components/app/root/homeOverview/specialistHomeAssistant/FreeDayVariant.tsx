import React, { memo } from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";
import { formatTimeString } from "@/src/utils/date/formatTime";
import { CopyLinkButton } from "@/src/components/shared/copyLinkButton";

type Props = {
  nickname: string;
  startAt: string;
  endAt: string;
};

function FreeDayVariantComponent({ nickname, startAt, endAt }: Props) {
  const link = nickname
    ? `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${nickname}`
    : null;
  const displayLink = nickname
    ? `${process.env.EXPO_PUBLIC_BOOKING_DISPLAY_URL}/${nickname}`
    : null;

  return (
    <View className="gap-3">
      {startAt && endAt && (
        <Typography weight="semibold" className="text-lg">
          День пока свободен. Расписание{" "}
          <Typography weight="semibold" className="text-neutral-500">
            открыто
          </Typography>{" "}
          с {formatTimeString(startAt)} до {formatTimeString(endAt)}
        </Typography>
      )}
      {link && displayLink && (
        <>
          <Typography weight="semibold" className="text-lg">
            Поделись ссылкой со своими клиентами
          </Typography>
          <CopyLinkButton link={link} displayLink={displayLink} />
        </>
      )}
    </View>
  );
}

export default memo(FreeDayVariantComponent);
