import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "./json/ru.json";
import en from "./json/en.json";
import { LangCode } from "./LanguageUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "language";

const resources = {
  ru: {
    translation: ru,
  },
  en: {
    translation: en,
  },
};

const initI18n = async () => {
  let language = await AsyncStorage.getItem(STORAGE_KEY);

  if (!language) {
    language = LangCode.ru;
    await AsyncStorage.setItem(STORAGE_KEY, language);
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: LangCode.ru,
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;
