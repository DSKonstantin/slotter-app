import React from "react";
import { View } from "react-native";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, IconButton, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { colors } from "@/src/styles/colors";

type FormValues = {
  links: { url: string }[];
};

const schema = Yup.object({
  links: Yup.array()
    .of(
      Yup.object({
        url: Yup.string()
          .url("Введите корректную ссылку")
          .required("Ссылка не может быть пустой"),
      }),
    )
    .required(),
});

const Links = () => {
  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      links: [{ url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "links",
  });

  const watchedLinks = methods.watch("links");

  const onSubmit = (data: FormValues) => {
    // TODO: save links
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Ссылки">
        {({ topInset, bottomInset }) => (
          <>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: topInset + 16,
                paddingBottom: 16,
              }}
            >
              <View className="px-screen gap-1">
                {fields.map((field, index) => (
                  <View key={field.id}>
                    <RhfTextField
                      label={`Ссылка №${index + 1}`}
                      name={`links.${index}.url`}
                      placeholder="https://"
                      autoCapitalize="none"
                      keyboardType="url"
                      startAdornment={
                        <StSvg
                          name="glob_fill"
                          size={24}
                          color={colors.neutral[900]}
                        />
                      }
                      endAdornment={
                        watchedLinks[index]?.url ? (
                          <IconButton
                            size="xs"
                            onPress={() =>
                              fields.length > 1
                                ? remove(index)
                                : methods.setValue(`links.${index}.url`, "")
                            }
                            icon={
                              <StSvg
                                name="close_ring_fill_light"
                                size={24}
                                color={colors.neutral[400]}
                              />
                            }
                          />
                        ) : null
                      }
                    />
                  </View>
                ))}

                <Button
                  variant="clear"
                  title="Добавить"
                  onPress={() => append({ url: "" })}
                  rightIcon={
                    <StSvg
                      name="Add_ring_fill"
                      size={22}
                      color={colors.neutral[900]}
                    />
                  }
                />
              </View>
            </KeyboardAwareScrollView>

            <View
              className="px-screen"
              style={{ paddingBottom: bottomInset + 16 }}
            >
              <Button
                title="Сохранить изменения"
                onPress={methods.handleSubmit(onSubmit)}
                rightIcon={
                  <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
                }
              />
            </View>
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default Links;
