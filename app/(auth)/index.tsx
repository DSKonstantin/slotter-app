import { Button, View } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { Tabs } from "@/src/components/ui";
import { RegisterForm } from "@/src/components/auth/registerForm";
import { LoginForm } from "@/src/components/auth/loginForm";

export default function AuthIndex() {
  const [tab, setTab] = useState<"login" | "register">("register");

  return (
    <View className="flex-1 px-5 pt-10">
      <Tabs
        value={tab}
        options={[
          { label: "Войти", value: "login" },
          { label: "Зарегистрироваться", value: "register" },
        ]}
        onChange={setTab}
      />

      {tab === "register" && (
        <RegisterForm
          onSubmit={({ phone }) =>
            router.push({
              pathname: "/(auth)/confirm",
              params: { phone },
            })
          }
        />
      )}

      {tab === "login" && (
        <LoginForm
          onSubmit={({ phone }) =>
            router.push({
              pathname: "/(auth)/confirm",
              params: { phone },
            })
          }
        />
      )}

      <Button
        title="Открыть auth modal (test)"
        onPress={() => router.push("/")}
      />
    </View>
  );
}
