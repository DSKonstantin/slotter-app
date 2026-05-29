import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { KeyboardEvents } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import * as Contacts from "expo-contacts";

import { Avatar, Input, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

export type PickedContact = {
  name: string;
  phone: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (contact: PickedContact) => void;
};

type ContactItem = {
  id: string;
  name: string;
  phone: string;
};

const ContactRow = React.memo(function ContactRow({
  item,
  onPress,
}: {
  item: ContactItem;
  onPress: (item: ContactItem) => void;
}) {
  return (
    <Pressable
      className="flex-row items-center px-screen py-3 gap-3 active:opacity-70"
      onPress={() => onPress(item)}
    >
      <Avatar name={item.name} size="sm" />
      <View className="flex-1">
        <Text className="font-inter-semibold text-body text-neutral-900">
          {item.name}
        </Text>
        <Text className="font-inter-regular text-caption text-neutral-500">
          {item.phone}
        </Text>
      </View>
    </Pressable>
  );
});

const Separator = () => <View className="mx-screen h-px bg-background" />;

const LIST_MAX_HEIGHT = 400;
const LIST_MIN_HEIGHT = 200;

const ContactPickerModal = ({ visible, onClose, onSelect }: Props) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();

  const available = height - top - bottom - keyboardHeight;
  const listHeight = Math.max(
    LIST_MIN_HEIGHT,
    Math.min(available * 0.5, LIST_MAX_HEIGHT),
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [contacts, search]);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      const items: ContactItem[] = [];
      for (const c of data) {
        if (!c.name || !c.phoneNumbers?.length) continue;
        for (const pn of c.phoneNumbers) {
          if (!pn.number) continue;
          items.push({
            id: `${c.id}-${pn.id ?? pn.number}`,
            name: c.name,
            phone: pn.number,
          });
          break;
        }
      }
      setContacts(items);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = useCallback(
    (item: ContactItem) => {
      onSelect({ name: item.name, phone: item.phone });
      onClose();
    },
    [onSelect, onClose],
  );

  const renderItem = useCallback<ListRenderItem<ContactItem>>(
    ({ item }) => <ContactRow item={item} onPress={handleSelect} />,
    [handleSelect],
  );

  const keyExtractor = useCallback((item: ContactItem) => item.id, []);

  useEffect(() => {
    if (visible) {
      setSearch("");
      loadContacts();
    } else {
      setKeyboardHeight(0);
    }
  }, [visible, loadContacts]);

  useEffect(() => {
    const show = KeyboardEvents.addListener("keyboardWillShow", (e) =>
      setKeyboardHeight(e.height),
    );
    const hide = KeyboardEvents.addListener("keyboardWillHide", () =>
      setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <StModal visible={visible} onClose={onClose} horizontalPadding={false}>
      <View style={{ paddingBottom: keyboardHeight }}>
        <View className="px-screen pb-3">
          <Typography weight="semibold" className="text-display text-center">
            Выбрать контакт
          </Typography>
        </View>

        <View className="px-screen pb-3">
          <Input
            placeholder="Поиск"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoFocus
            hideErrorText
            startAdornment={
              <StSvg name="Search" size={20} color={colors.neutral[400]} />
            }
            endAdornment={
              search.length > 0 ? (
                <Pressable onPress={() => setSearch("")}>
                  <StSvg
                    name="close_ring_fill_light"
                    size={20}
                    color={colors.neutral[400]}
                  />
                </Pressable>
              ) : undefined
            }
          />
        </View>

        {loading ? (
          <View
            className="items-center justify-center"
            style={{ height: LIST_MIN_HEIGHT }}
          >
            <ActivityIndicator />
          </View>
        ) : (
          <View style={{ height: listHeight }}>
            <FlashList
              data={filtered}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
              ItemSeparatorComponent={Separator}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center pt-10 gap-2">
                  <StSvg
                    name="User_fill"
                    size={40}
                    color={colors.neutral[300]}
                  />
                  <Typography className="text-body text-neutral-400">
                    {search ? "Контакты не найдены" : "Нет контактов"}
                  </Typography>
                </View>
              }
            />
          </View>
        )}
      </View>
    </StModal>
  );
};

export default ContactPickerModal;
