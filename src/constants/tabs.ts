const TOOLBAR_HEIGHT = 64;
const TAB_BAR_HEIGHT = 62;
const BOTTOM_OFFSET = 80;
const BOTTOM_OFFSET_SMALL = 30;

const TABS = [
  { key: "index", label: "Главная", icon: "Home" },
  { key: "history", label: "Записи", icon: "File_dock_fill" },
  { key: "chat", label: "Чат", icon: "Chat_fill" },
  { key: "account", label: "Профиль", icon: "User_fill" },
] as const;

export {
  TAB_BAR_HEIGHT,
  TABS,
  TOOLBAR_HEIGHT,
  BOTTOM_OFFSET,
  BOTTOM_OFFSET_SMALL,
};
