import { View, Text, Linking } from "react-native";
import { useForm, Controller } from "react-hook-form";

import { Input, Button, Checkbox } from "@/src/components/ui";

type RegisterFormData = {
  name: string;
  phone: string;
  agree: boolean;
};

type RegisterFormProps = {
  onSubmit: (data: RegisterFormData) => void;
};

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      phone: "",
      agree: false,
    },
    mode: "onChange",
  });

  const agree = watch("agree");

  return (
    <View>
      <Text className="mt-6 mb-2 text-sm text-gray-500">Имя</Text>
      <Controller
        control={control}
        name="name"
        rules={{ required: true, minLength: 2 }}
        render={({ field: { value, onChange } }) => (
          <Input
            placeholder="Как к вам обращаться"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Text className="mt-4 mb-2 text-sm text-gray-500">Телефон</Text>
      <Controller
        control={control}
        name="phone"
        rules={{ required: true, minLength: 6 }}
        render={({ field: { value, onChange } }) => (
          <Input
            placeholder="+7 (999) 999-99-99"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <View className="mt-4 flex-row items-center gap-2">
        <Controller
          control={control}
          name="agree"
          rules={{ validate: (v) => v === true }}
          render={({ field: { value, onChange } }) => (
            <Checkbox value={value} onChange={onChange} />
          )}
        />
        <Text className="text-sm text-gray-600">
          Соглашаюсь с{" "}
          <Text
            className="underline text-gray-900"
            onPress={() => Linking.openURL("#")}
          >
            Правилами
          </Text>{" "}
          и{" "}
          <Text
            className="underline text-gray-900"
            onPress={() => Linking.openURL("#")}
          >
            Политикой
          </Text>
        </Text>
      </View>

      <View className="mt-8">
        <Button
          title="Создать аккаунт"
          disabled={!isValid || !agree}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <Text
        className="underline text-gray-500 mt-4 text-center"
        onPress={() => Linking.openURL("#")}
      >
        Обратиться в поддержку
      </Text>
    </View>
  );
}
