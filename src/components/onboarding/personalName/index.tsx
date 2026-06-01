import React, { useCallback } from "react";
import { View } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { useUpdateCustomerMutation } from "@/src/store/redux/services/api/usersApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useAuth } from "@/src/contexts/AuthContext";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

const schema = yup.object({ name: yup.string().trim().required("Введите имя") });

type FormValues = { name: string };

const PersonalName = () => {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const { setLocalOnboardingComplete } = useAuth();
  const [updateCustomer, { isLoading }] = useUpdateCustomerMutation();

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = useCallback(
    async (data: FormValues) => {
      if (!userId) return;
      try {
        await updateCustomer({ id: userId, data: { customer: { name: data.name.trim() } } }).unwrap();
        await AsyncStorage.setItem("onboarding_complete", "true");
        setLocalOnboardingComplete(true);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось сохранить имя"));
      }
    },
    [userId, updateCustomer, setLocalOnboardingComplete],
  );

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        avoidKeyboard
        header={<AuthHeader />}
        footer={
          <AuthFooter
            primary={{
              title: "Далее",
              loading: isLoading,
              disabled: isLoading,
              onPress: methods.handleSubmit(onSubmit),
            }}
          />
        }
      >
        <View className="mt-8">
          <Typography weight="semibold" className="text-display mb-2">
            Твое имя
          </Typography>
          <Typography className="text-body text-neutral-500 mb-9">
            Чтобы специалист знал как к тебе обращаться
          </Typography>
          <RhfTextField name="name" label="Имя" placeholder="Александр" />
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default PersonalName;
