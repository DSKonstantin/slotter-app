const COMPACT_BREAKPOINT = 390;
const TOOLBAR_HEIGHT = 64;
const TAB_BAR_HEIGHT = 58;
const TAB_BAR_HEIGHT_LARGE = 70;
const BOTTOM_OFFSET = 80;
const BOTTOM_OFFSET_SMALL = 30;

const TABS = [
  { key: "index", label: "Главная", icon: "Home" },
  { key: "calendar", label: "Календарь", icon: "Date_range_fill" },
  { key: "chat", label: "Чат", icon: "Notification" },
  { key: "clients", label: "Клиенты", icon: "Group_fill" },
] as const;

export {
  COMPACT_BREAKPOINT,
  TAB_BAR_HEIGHT,
  TAB_BAR_HEIGHT_LARGE,
  TABS,
  TOOLBAR_HEIGHT,
  BOTTOM_OFFSET,
  BOTTOM_OFFSET_SMALL,
};
