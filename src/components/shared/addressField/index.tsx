import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import debounce from "lodash/debounce";
import { Item, StSvg } from "@/src/components/ui";
import { Autocomplete } from "@/src/components/ui/fields/Autocomplete";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";
import { useDaDataSuggestions } from "@/src/hooks/useDaDataSuggestions";

export function AddressField() {
  const { control } = useFormContext();
  const hideAddress = useWatch({ name: "hideAddress" });
  const [query, setQuery] = useState("");
  const { suggestions } = useDaDataSuggestions(query);

  const debouncedSetQuery = useMemo(
    () => debounce((text: string) => setQuery(text), 500),
    [],
  );

  return (
    <View className="gap-2">
      <Controller
        name="address"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Autocomplete
            label="Адрес"
            placeholder="Москва, ул. Пушкина, 5"
            value={value}
            error={error}
            hideErrorText
            disabled={hideAddress}
            dataSet={suggestions}
            onChangeText={(text) => {
              onChange(text);
              debouncedSetQuery(text);
            }}
            onSelectItem={(item) => {
              if (item) {
                onChange(item.id);
                setQuery(item.title ?? "");
              }
            }}
          />
        )}
      />
      <Item
        title="Скрыть адрес"
        left={
          <StSvg name="View_hide_fill" size={24} color={colors.neutral[900]} />
        }
        right={<RHFSwitch name="hideAddress" />}
      />
    </View>
  );
}
