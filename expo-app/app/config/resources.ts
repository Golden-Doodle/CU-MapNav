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

import enCampusMap from "@/app/locales/en/CampusMap.json"
import frCampusMap from "@/app/locales/fr/CampusMap.json"
import esCampusMap from "@/app/locales/es/CampusMap.json"
import itCampusMap from "@/app/locales/it/CampusMap.json"
import heCampusMap from "@/app/locales/he/CampusMap.json"
import arCampusMap from "@/app/locales/ar/CampusMap.json"


/*
  * Define your resources here
  * The key is the language code
  * The value is the JSON object
  * Do this for each screen you have
  * Don't forget to import the JSON files at the top
  * Don't forget to add the new Screen to the ns array in i18n.ts
  */
const resources = {
  en: { HomePageScreen: enHomePageScreen, HomeMenuScreen: enHomeMenuScreen, CampusMap: enCampusMap },
  fr: { HomePageScreen: frHomePageScreen, HomeMenuScreen: frHomeMenuScreen, CampusMap: frCampusMap },
  es: { HomePageScreen: esHomePageScreen, HomeMenuScreen: esHomeMenuScreen, CampusMap: esCampusMap },
  it: { HomePageScreen: itHomePageScreen, HomeMenuScreen: itHomeMenuScreen, CampusMap: itCampusMap },
  he: { HomePageScreen: heHomePageScreen, HomeMenuScreen: heHomeMenuScreen, CampusMap: heCampusMap },
  ar: { HomePageScreen: arHomePageScreen, HomeMenuScreen: arHomeMenuScreen, CampusMap: arCampusMap },
};

export default resources;