import i18n from "@/src/utils/languages/i18nextConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LangCode } from "@/src/utils/languages/LanguageUtils";

export async function changeLanguage(lang: LangCode) {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem("language", lang);
}
