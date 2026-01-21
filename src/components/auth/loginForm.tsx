import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";

import { Input, Button } from "@/src/components/ui";

type LoginFormData = {
  phone: string;
};

type LoginFormProps = {
  onSubmit: (data: LoginFormData) => void;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginFormData>({
    defaultValues: {
      phone: "",
    },
    mode: "onChange",
  });

  return (
    <View>
      <Text className="mt-6 mb-2 text-sm text-gray-500">Телефон</Text>
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

      <View className="mt-8">
        <Button
          title="Войти"
          disabled={!isValid}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}
