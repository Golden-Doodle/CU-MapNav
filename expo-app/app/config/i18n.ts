import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import resources from "@/app/config/resources";

// Function to load the saved language or default to device language
const getLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem("language");
    if (savedLang) return savedLang;

    const locales = Localization.getLocales();
    return locales[0]?.languageCode ?? "en"; // Use device language if no saved language || default to English
  } catch (error) {
    console.error("Error loading language:", error);
    return "en";
  }
};

// Initialize i18n after getting the language
(async () => {
  const lng = await getLanguage();
  // For testing purposes - you may set the language here
  i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "en",
    ns: [
      "HomePageScreen",
      "HomeMenuScreen",
      "CampusMap",
      "AccountSettingsScreen",
      "ScheduleScreen",
      "SettingsScreen",
      "SupportScreen",
    ], // Define namespaces based on screen names, Remember to add the screen json to the resourses object that is imported
    defaultNS: "HomePageScreen",
    interpolation: { escapeValue: false },
  });
})();

// Save selected language when changed
i18n.on("languageChanged", (lng) => {
  AsyncStorage.setItem("language", lng);
});

export default i18n;
