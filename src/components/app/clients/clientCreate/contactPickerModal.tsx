import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
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

const ContactRow = ({
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
);

const ContactPickerModal = ({ visible, onClose, onSelect }: Props) => {
  const { height } = useWindowDimensions();
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

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [contacts, search]);

  const handleSelect = useCallback(
    (item: ContactItem) => {
      onSelect({ name: item.name, phone: item.phone });
      onClose();
    },
    [onSelect, onClose],
  );

  useEffect(() => {
    if (visible) {
      setSearch("");
      loadContacts();
    }
  }, [visible, loadContacts]);

  return (
    <StModal visible={visible} onClose={onClose} horizontalPadding={false}>
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
        <View className="items-center justify-center py-10">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: height * 0.55 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ContactRow item={item} onPress={handleSelect} />
          )}
          ItemSeparatorComponent={() => (
            <View className="mx-screen h-px bg-background" />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center pt-10 gap-2">
              <StSvg name="User_fill" size={40} color={colors.neutral[300]} />
              <Typography className="text-body text-neutral-400">
                {search ? "Контакты не найдены" : "Нет контактов"}
              </Typography>
            </View>
          }
        />
      )}
    </StModal>
  );
};

export default ContactPickerModal;
