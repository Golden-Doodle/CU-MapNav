// Import JSON files (following your naming convention)
import enHomePageScreen from "@/app/locales/en/HomePageScreen.json";
import frHomePageScreen from "@/app/locales/fr/HomePageScreen.json";
import esHomePageScreen from "@/app/locales/es/HomePageScreen.json";
import itHomePageScreen from "@/app/locales/it/HomePageScreen.json";
import heHomePageScreen from "@/app/locales/he/HomePageScreen.json";
import arHomePageScreen from "@/app/locales/ar/HomePageScreen.json";

import enHomeMenuScreen from "@/app/locales/en/HomeMenuScreen.json";
import frHomeMenuScreen from "@/app/locales/fr/HomeMenuScreen.json";
import esHomeMenuScreen from "@/app/locales/es/HomeMenuScreen.json";
import itHomeMenuScreen from "@/app/locales/it/HomeMenuScreen.json";
import heHomeMenuScreen from "@/app/locales/he/HomeMenuScreen.json";
import arHomeMenuScreen from "@/app/locales/ar/HomeMenuScreen.json";


/*
  * Define your resources here
  * The key is the language code
  * The value is the JSON object
  * Do this for each screen you have
  * Don't forget to import the JSON files at the top
  * Don't forget to add the new Screen to the ns array in i18n.ts
  */
const resources = {
  en: { HomePageScreen: enHomePageScreen, HomeMenuScreen: enHomeMenuScreen },
  fr: { HomePageScreen: frHomePageScreen, HomeMenuScreen: frHomeMenuScreen },
  es: { HomePageScreen: esHomePageScreen, HomeMenuScreen: esHomeMenuScreen },
  it: { HomePageScreen: itHomePageScreen, HomeMenuScreen: itHomeMenuScreen },
  he: { HomePageScreen: heHomePageScreen, HomeMenuScreen: heHomeMenuScreen },
  ar: { HomePageScreen: arHomePageScreen, HomeMenuScreen: arHomeMenuScreen },
};

export default resources;