import { View } from "react-native";

import { StoryPill } from "./StoryPill";

export type StoryAppTab = {
  icon: string;
  label: string;
  hasDot?: boolean;
};

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

const TAB_OPACITY = [1, 0.8, 0.6, 0.4];
const getTabOpacity = (index: number) =>
  TAB_OPACITY[index] ?? TAB_OPACITY[TAB_OPACITY.length - 1];

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
