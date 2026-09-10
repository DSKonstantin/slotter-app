import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useToolbarSearch } from "@/src/components/shared/layout/toolbarContext";
import {
  Badge,
  Button,
  FloatingFooter,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { Routers } from "@/src/constants/routers";
import BroadcastCard from "./BroadcastCard";
import { useBroadcastGate } from "./useBroadcastGate";
import {
  BROADCASTS,
  BROADCAST_FILTERS,
  type BroadcastFilter,
  type BroadcastItem,
} from "./broadcastMock";

type ContentProps = {
  topInset: number;
  bottomInset: number;
};

const Separator = () => <View className="h-3" />;

const BroadcastContent = ({ topInset, bottomInset }: ContentProps) => {
  const [filter, setFilter] = useState<BroadcastFilter>("all");
  const [search, setSearch] = useState("");

  const { guard, isLoading: gateLoading, modal } = useBroadcastGate();

  const { searchMode } = useToolbarSearch({
    placeholder: "Название или текст",
    onChange: setSearch,
    onClose: () => setSearch(""),
  });

  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    return BROADCASTS.filter((item) => {
      const matchesFilter = filter === "all" || item.filter === filter;
      const matchesSearch =
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const renderItem = useCallback(
    ({ item }: { item: BroadcastItem }) => <BroadcastCard item={item} />,
    [],
  );

  return (
    <>
      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topInset,
          paddingBottom: bottomInset + 120,
          paddingHorizontal: SCREEN_PADDING,
        }}
        ListHeaderComponent={
          searchMode ? null : (
            <View className="flex-row flex-wrap gap-2 pb-3">
              {BROADCAST_FILTERS.map(({ label, value }) => (
                <Badge
                  key={value}
                  title={label}
                  variant={value === filter ? "accent" : "ghost"}
                  onPress={() => setFilter(value)}
                />
              ))}
            </View>
          )
        }
        ListEmptyComponent={
          <Typography className="text-body text-neutral-400 text-center mt-10">
            Рассылок пока нет
          </Typography>
        }
      />

      <FloatingFooter offset={bottomInset + 8}>
        <Button
          title="Создать новую рассылку"
          variant="accent"
          disabled={gateLoading}
          onPress={() =>
            guard(() => router.push(Routers.app.clients.broadcastCreate))
          }
          rightIcon={
            <StSvg name="Add_round_fill" size={24} color={colors.neutral[0]} />
          }
        />
      </FloatingFooter>

      {modal}
    </>
  );
};

const BroadcastList = () => (
  <ScreenWithToolbar
    title="Ваши рассылки"
    fallbackHref={Routers.app.clients.root}
    rightButton={(toolbar) => (
      <IconButton
        onPress={toolbar?.openSearch}
        accessibilityLabel="Поиск"
        icon={<StSvg name="Search" size={28} color={colors.neutral[900]} />}
      />
    )}
  >
    {({ topInset, bottomInset }) => (
      <BroadcastContent topInset={topInset} bottomInset={bottomInset} />
    )}
  </ScreenWithToolbar>
);

export default BroadcastList;
