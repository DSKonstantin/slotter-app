import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import * as Contacts from "expo-contacts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, IconButton, StSvg, Typography } from "@/src/components/ui";
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

const ContactRow = React.memo(
  ({
    item,
    onPress,
  }: {
    item: ContactItem;
    onPress: (item: ContactItem) => void;
  }) => (
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
  ),
);

const ContactPickerModal = ({ visible, onClose, onSelect }: Props) => {
  const { top, bottom } = useSafeAreaInsets();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
          break; // only first phone number per contact
        }
      }
      setContacts(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setSearch("");
      loadContacts();
    }
  }, [visible, loadContacts]);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [contacts, search]);

  const handleSelect = useCallback(
    (item: ContactItem) => {
      onSelect({ name: item.name, phone: item.phone });
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background" style={{ paddingTop: top }}>
        {/* Header */}
        <View className="flex-row items-center px-screen py-3 gap-2">
          <Text className="flex-1 font-inter-semibold text-[18px] text-neutral-900">
            Выбрать контакт
          </Text>
          <IconButton
            icon={
              <StSvg
                name="close_ring_fill_light"
                size={28}
                color={colors.neutral[900]}
              />
            }
            onPress={onClose}
            accessibilityLabel="Закрыть"
          />
        </View>

        {/* Search */}
        <View className="px-screen pb-3">
          <View className="flex-row items-center bg-white rounded-2xl px-4 h-[48px] border border-background gap-2">
            <StSvg name="Search" size={20} color={colors.neutral[400]} />
            <TextInput
              className="flex-1 font-inter-regular text-body text-neutral-900"
              placeholder="Поиск"
              placeholderTextColor={colors.neutral[400]}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoFocus
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <StSvg
                  name="close_ring_fill_light"
                  size={20}
                  color={colors.neutral[400]}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: bottom + 16 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ContactRow item={item} onPress={handleSelect} />
            )}
            ItemSeparatorComponent={() => (
              <View className="mx-screen h-px bg-background" />
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center pt-20 gap-2">
                <StSvg name="User_fill" size={40} color={colors.neutral[300]} />
                <Typography className="text-body text-neutral-400">
                  {search ? "Контакты не найдены" : "Нет контактов"}
                </Typography>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
};

export default ContactPickerModal;
