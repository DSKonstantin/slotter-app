import { Alert } from "react-native";
import { pluralize } from "@/src/utils/text/pluralize";

export const buildOutsideHoursMessage = (count: number) => {
  const noun = pluralize(count, [
    "фиксированное время",
    "фиксированных времени",
    "фиксированных времён",
  ]);
  const isSingular = pluralize(count, ["one", "few", "many"]) === "one";
  return isSingular
    ? `${count} ${noun} выйдет за пределы нового графика и перестанет предлагаться клиентам`
    : `${count} ${noun} выйдут за пределы нового графика и перестанут предлагаться клиентам`;
};

export const confirmFixedTimesOutside = (count: number) =>
  new Promise<boolean>((resolve) => {
    Alert.alert(
      "Изменить рабочие часы?",
      buildOutsideHoursMessage(count),
      [
        { text: "Отмена", style: "cancel", onPress: () => resolve(false) },
        { text: "Сохранить", onPress: () => resolve(true) },
      ],
      { onDismiss: () => resolve(false) },
    );
  });
