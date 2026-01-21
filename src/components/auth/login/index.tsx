import React from "react";
import { TextInput, View } from "react-native";
import { Typography } from "@/src/components/ui";
import { Controller, useFormContext } from "react-hook-form";

const Login = () => {
  const { control } = useFormContext();

  return (
    <View className="mt-14">
      <Typography weight="semibold" className="text-display mb-2">
        С возвращением!
      </Typography>
      <Typography weight="medium" className="text-body text-gray">
        Введи номер, мы найдем профиль
      </Typography>

      <Controller
        control={control}
        name="phone"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Номер телефона"
            className="border border-gray-300 rounded-xl px-4 py-3"
            keyboardType="phone-pad"
          />
        )}
      />
    </View>
  );
};

export default Login;
