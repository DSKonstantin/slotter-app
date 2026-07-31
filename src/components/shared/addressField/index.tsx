import React, { useRef, useState } from "react";
import { View } from "react-native";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Autocomplete } from "@/src/components/ui/fields/Autocomplete";
import { useDaDataSuggestions } from "@/src/hooks/useDaDataSuggestions";

export function AddressField() {
  const { control } = useFormContext();
  const hideAddress = useWatch({ name: "hideAddress" });
  const [query, setQuery] = useState("");
  const { suggestions, isLoading } = useDaDataSuggestions(query);
  const justSelected = useRef(false);

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
            loading={isLoading}
            debounceDelay={800}
            onChangeText={(text) => {
              onChange(text);
              if (justSelected.current) {
                justSelected.current = false;
              } else {
                setQuery(text);
              }
            }}
            onSelectItem={(item) => {
              if (item) {
                onChange(item.id);
                justSelected.current = true;
              }
            }}
          />
        )}
      />
    </View>
  );
}
