import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useController, useFormContext } from "react-hook-form";
import { Tag, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type RHFTagInputProps = {
  name: string;
  label?: string;
  placeholder?: string;
  maxTags?: number;
};

const RHFTagInput = ({
  name,
  label,
  placeholder = "Добавить тег",
  maxTags = 20,
}: RHFTagInputProps) => {
  const { control } = useFormContext();
  const {
    field: { value, onChange },
  } = useController({ name, control, defaultValue: [] });

  const tags: string[] = value ?? [];

  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <View className="gap-2">
      {label ? (
        <Text className="font-inter-medium text-caption text-neutral-500">
          {label}
        </Text>
      ) : null}

      {tags.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <Pressable key={tag} onPress={() => handleRemove(tag)}>
              <Tag
                title={tag}
                size="sm"
                icon={
                  <StSvg
                    name="Close_round"
                    size={14}
                    color={colors.neutral[500]}
                  />
                }
              />
            </Pressable>
          ))}
        </View>
      )}

      <View className="flex-row items-center gap-2">
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAdd}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          returnKeyType="done"
          blurOnSubmit={false}
          className="flex-1 h-[48px] px-4 rounded-2xl bg-white border border-background font-inter-regular text-body text-neutral-900"
        />
        <Pressable
          onPress={handleAdd}
          disabled={!inputValue.trim() || tags.length >= maxTags}
          className="h-[48px] w-[48px] rounded-2xl bg-background-black items-center justify-center active:opacity-60 disabled:opacity-40"
        >
          <StSvg name="Add_round" size={22} color={colors.neutral[0]} />
        </Pressable>
      </View>
    </View>
  );
};

export default RHFTagInput;
