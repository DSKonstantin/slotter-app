import { View, Pressable, Text } from "react-native";

export type TabOption<T extends string> = {
  label: string;
  value: T;
};

type TabsProps<T extends string> = {
  value: T;
  options: TabOption<T>[];
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({
  value,
  options,
  onChange,
}: TabsProps<T>) {
  return (
    <View className="flex-row rounded-full bg-white p-1">
      {options.map((opt) => {
        const active = value === opt.value;

        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`flex-1 items-center rounded-full py-2 ${
              active ? "bg-blue-500" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                active ? "text-white" : "text-gray-400"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
