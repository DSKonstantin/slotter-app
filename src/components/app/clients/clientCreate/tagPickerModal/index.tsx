import React, { useState } from "react";
import { View, Pressable, FlatList, ActivityIndicator } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";

import { StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useGetCustomerTagsQuery } from "@/src/store/redux/services/api/customersApi";
import type { CustomerTag } from "@/src/store/redux/services/api-types";
import CreateTagModal from "../createTagModal";

type Props = {
  visible: boolean;
  userId: number;
  selectedTagId: number | null;
  onClose: () => void;
  onSelect: (tag: CustomerTag | null) => void;
};

const TagRow = React.memo(
  ({
    tag,
    selected,
    onPress,
  }: {
    tag: CustomerTag;
    selected: boolean;
    onPress: (tag: CustomerTag) => void;
  }) => (
    <Pressable
      className="flex-row items-center px-screen py-3.5 gap-3 active:opacity-70"
      onPress={() => onPress(tag)}
    >
      <View
        className="w-8 h-8 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      <Typography className="flex-1 text-body text-neutral-900">
        {tag.name}
      </Typography>
      {selected && (
        <StSvg name="Check_fill" size={20} color={colors.primary.blue[500]} />
      )}
    </Pressable>
  ),
);

const TagPickerModal = ({
  visible,
  userId,
  selectedTagId,
  onClose,
  onSelect,
}: Props) => {
  const [createVisible, setCreateVisible] = useState(false);

  const { data, isLoading } = useGetCustomerTagsQuery(
    visible ? { userId } : skipToken,
  );

  const tags = data?.customer_tags ?? [];

  const handleTagPress = (tag: CustomerTag) => {
    if (selectedTagId === tag.id) {
      onSelect(null);
    } else {
      onSelect(tag);
    }
    onClose();
  };

  const handleCreated = (tag: CustomerTag) => {
    onSelect(tag);
    onClose();
  };

  return (
    <>
      <StModal visible={visible} onClose={onClose} horizontalPadding={false}>
        <View className="px-screen pb-3">
          <Typography weight="semibold" className="text-display text-center">
            Тег клиента
          </Typography>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={tags}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TagRow
                tag={item}
                selected={selectedTagId === item.id}
                onPress={handleTagPress}
              />
            )}
            ItemSeparatorComponent={() => (
              <View className="mx-screen h-px bg-background" />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center pt-6 pb-2 gap-2">
                <Typography className="text-body text-neutral-400">
                  Нет тегов
                </Typography>
              </View>
            }
          />
        )}

        <View className="mx-screen mt-3 mb-1">
          <Pressable
            className="flex-row items-center gap-2 py-3 active:opacity-70"
            onPress={() => setCreateVisible(true)}
          >
            <StSvg
              name="Add_ring_fill"
              size={22}
              color={colors.primary.blue[500]}
            />
            <Typography className="text-body text-primary-blue-500">
              Создать тег
            </Typography>
          </Pressable>
        </View>
      </StModal>

      <CreateTagModal
        visible={createVisible}
        userId={userId}
        onClose={() => setCreateVisible(false)}
        onCreated={handleCreated}
      />
    </>
  );
};

export default React.memo(TagPickerModal);
