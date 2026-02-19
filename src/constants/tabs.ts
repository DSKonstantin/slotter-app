const TOOLBAR_HEIGHT = 68;
const TAB_BAR_HEIGHT = 65;

const TABS = [
  { key: "index", label: "Главная", icon: "Home" },
  { key: "calendar", label: "Календарь", icon: "Date_range_fill" },
  { key: "chat", label: "Чат", icon: "Notification" },
  { key: "clients", label: "Клиенты", icon: "Group_fill" },
] as const;

export { TAB_BAR_HEIGHT, TABS, TOOLBAR_HEIGHT };
