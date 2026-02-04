import React from "react";
import { ScrollView, View } from "react-native";
import { Typography } from "@/src/components/ui";

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-6 gap-4">
        <Typography className="text-[28px] leading-8" weight="semibold">
          Главная 👋
        </Typography>
        <Typography className="text-neutral-500">
          Это тестовый контент, чтобы было видно экран и отступы.
        </Typography>
        <View className="bg-background-surface rounded-large p-4 gap-2">
          <Typography weight="semibold">Карточка #1</Typography>
          <Typography className="text-neutral-500">
            Тут может быть любой контент, статистика, блоки и т.д.
          </Typography>
        </View>
        <View className="bg-background-surface rounded-large p-4 gap-2">
          <Typography weight="semibold">Карточка #2</Typography>
          <Typography className="text-neutral-500">
            Например: заявки, календарь, чаты или клиенты.
          </Typography>
        </View>
        <View className="bg-background-surface rounded-large p-4 gap-2">
          <Typography weight="semibold">Карточка #3</Typography>
          <Typography className="text-neutral-500">
            Просто чтобы проверить скролл и UI.
          </Typography>
        </View>
        <View className="bg-primary-blue-500 rounded-large p-4">
          <Typography weight="semibold" className="text-neutral-0">
            Большой акцентный блок
          </Typography>
          <Typography className="text-neutral-0 opacity-80">
            Например для CTA / промо.
          </Typography>
        </View>
        <View className="bg-primary-blue-500 rounded-large p-4">
          <Typography weight="semibold" className="text-neutral-0">
            Большой акцентный блок
          </Typography>
          <Typography className="text-neutral-0 opacity-80">
            Например для CTA / промо.
          </Typography>
        </View>
        <View className="bg-primary-blue-500 rounded-large p-4">
          <Typography weight="semibold" className="text-neutral-0">
            Большой акцентный блок
          </Typography>
          <Typography className="text-neutral-0 opacity-80">
            Например для CTA / промо.
          </Typography>
        </View>
        <View className="bg-primary-blue-500 rounded-large p-4">
          <Typography weight="semibold" className="text-neutral-0">
            Большой акцентный блок
          </Typography>
          <Typography className="text-neutral-0 opacity-80">
            Например для CTA / промо.
          </Typography>
        </View>{" "}
        <View className="bg-primary-blue-500 rounded-large p-4">
          <Typography weight="semibold" className="text-neutral-0">
            Большой акцентный блок
          </Typography>
          <Typography className="text-neutral-0 opacity-80">
            Например для CTA / промо.
          </Typography>
        </View>{" "}
        <View className="bg-primary-blue-500 rounded-large p-4">
          <Typography weight="semibold" className="text-neutral-0">
            Большой акцентный блок
          </Typography>
          <Typography className="text-neutral-0 opacity-80">
            Например для CTA / промо.
          </Typography>
        </View>{" "}
        <View className="bg-primary-blue-500 rounded-large p-4">
          <Typography weight="semibold" className="text-neutral-0">
            Большой акцентный блок
          </Typography>
          <Typography className="text-neutral-0 opacity-80">
            Например для CTA / промо.
          </Typography>
        </View>{" "}
        <View className="bg-primary-blue-500 rounded-large p-4">
          <Typography weight="semibold" className="text-neutral-0">
            Большой акцентный блок
          </Typography>
          <Typography className="text-neutral-0 opacity-80">
            Например для CTA / промо.
          </Typography>
        </View>{" "}
        <View className="bg-primary-blue-500 rounded-large p-4">
          <Typography weight="semibold" className="text-neutral-0">
            Большой акцентный блок
          </Typography>
          <Typography className="text-neutral-0 opacity-80">
            Например для CTA / промо.
          </Typography>
        </View>
      </View>
    </ScrollView>
  );
}
