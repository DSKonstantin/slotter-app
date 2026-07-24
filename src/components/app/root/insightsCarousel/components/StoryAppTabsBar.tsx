import { View } from "react-native";

import { StoryPill } from "./StoryPill";

export type StoryAppTab = {
  icon: string;
  label: string;
  hasDot?: boolean;
};

// Состав и иконки повторяют реальное меню разделов приложения (см.
// src/components/navigation/tabBar/tabMenu/index.tsx) — обучающие сторис
// имитируют переключение по вкладкам, поэтому список держим в одном месте,
// чтобы не разъезжался с реальным меню. hasDot — красная точка-индикатор на
// иконке (см. "График" на assets/images/history/training/three.webp).
export const STORY_APP_TABS: StoryAppTab[] = [
  { icon: "User_circle", label: "Аккаунт" },
  { icon: "Date_today", label: "График", hasDot: true },
  { icon: "Desk_alt_fill", label: "Услуги" },
  { icon: "Bell_fill", label: "Журнал событий" },
  { icon: "Wallet_fill", label: "Финансы" },
];

type Props = {
  tabs?: StoryAppTab[];
  activeIndex?: number;
};

// Затухание по позиции в ряду: 1-й элемент как есть, дальше — 80/60/40%,
// последующие держат последнее значение.
const TAB_OPACITY = [1, 0.8, 0.6, 0.4];
const getTabOpacity = (index: number) =>
  TAB_OPACITY[index] ?? TAB_OPACITY[TAB_OPACITY.length - 1];

// Ряд пилюль-вкладок вверху обучающих слайдов (см. assets/images/history/training/*).
// Не интерактивен (pointerEvents="none") — это иллюстрация, не настоящая
// навигация; активная вкладка красится акцентным зелёным, остальные — блёклым
// серым, последняя может обрезаться краем экрана как на референсах. overflow-hidden
// обязателен: ряд шире экрана и обрезается локально, а не только внешним
// клипом трека сторис — иначе во время свайпа между слайдами "хвост" ряда
// едет вместе со слайдом и на середине анимации наезжает на соседний слайд.
export const StoryAppTabsBar = ({
  tabs = STORY_APP_TABS,
  activeIndex,
}: Props) => {
  return (
    <View className="flex-row gap-2 overflow-hidden" pointerEvents="none">
      {tabs.map((tab, index) => (
        <View key={tab.label} style={{ opacity: getTabOpacity(index) }}>
          <StoryPill
            icon={tab.icon}
            label={tab.label}
            active={index === activeIndex}
            hasDot={tab.hasDot}
          />
        </View>
      ))}
    </View>
  );
};
