import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Divider, Switch, Typography } from "@/src/components/ui";

type NotificationItem = {
  id: string;
  label: string;
  enabled: boolean;
};

type NotificationGroup = {
  section: string;
  items: NotificationItem[];
};

const INITIAL_GROUPS: NotificationGroup[] = [
  {
    section: "При записи",
    items: [{ id: "create", label: "Создание записи", enabled: true }],
  },
  {
    section: "Перед визитом",
    items: [
      { id: "reminder", label: "Напоминание о визите", enabled: true },
      { id: "reschedule", label: "Перенос записи", enabled: true },
      { id: "cancel", label: "Отмена записи", enabled: true },
    ],
  },
  {
    section: "После визита",
    items: [{ id: "review", label: "Запрос отзыва", enabled: false }],
  },
  {
    section: "Возвращаемость",
    items: [
      { id: "return", label: "Повторный визит", enabled: false },
      { id: "birthday", label: "День рождения", enabled: false },
      { id: "invite", label: "Приглашение после отмены", enabled: false },
    ],
  },
];

const NotificationTypes = () => {
  const [groups, setGroups] = useState(INITIAL_GROUPS);

  const toggle = (groupIndex: number, itemId: string) => {
    setGroups((prev) =>
      prev.map((group, gi) =>
        gi !== groupIndex
          ? group
          : {
              ...group,
              items: group.items.map((item) =>
                item.id !== itemId
                  ? item
                  : { ...item, enabled: !item.enabled },
              ),
            },
      ),
    );
  };

  return (
    <ScreenWithToolbar title="Виды уведомлений">
      {({ topInset, bottomInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 8,
          }}
          className="px-screen"
        >
          {groups.map((group, gi) => (
            <View key={group.section} className="mb-5">
              <Typography className="text-caption text-neutral-500 mb-2">
                {group.section}
              </Typography>

              <View className="bg-background-surface rounded-base px-4">
                {group.items.map((item, ii) => (
                  <React.Fragment key={item.id}>
                    {ii > 0 && <Divider />}
                    <View className="flex-row items-center justify-between py-3">
                      <View>
                        <Typography weight="medium" className="text-body">
                          {item.label}
                        </Typography>
                        <Typography
                          weight="regular"
                          className={`text-caption ${item.enabled ? "text-primary-green-600" : "text-neutral-400"}`}
                        >
                          {item.enabled ? "Включено" : "Выключено"}
                        </Typography>
                      </View>
                      <Switch
                        value={item.enabled}
                        onChange={() => toggle(gi, item.id)}
                      />
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default NotificationTypes;
