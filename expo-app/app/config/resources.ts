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

import enCampusMap from "@/app/locales/en/CampusMap.json";
import frCampusMap from "@/app/locales/fr/CampusMap.json";
import esCampusMap from "@/app/locales/es/CampusMap.json";
import itCampusMap from "@/app/locales/it/CampusMap.json";
import heCampusMap from "@/app/locales/he/CampusMap.json";
import arCampusMap from "@/app/locales/ar/CampusMap.json";

import enAccountSettingsScreen from "@/app/locales/en/AccountSettingsScreen.json";
import frAccountSettingsScreen from "@/app/locales/fr/AccountSettingsScreen.json";
import esAccountSettingsScreen from "@/app/locales/es/AccountSettingsScreen.json";
import itAccountSettingsScreen from "@/app/locales/it/AccountSettingsScreen.json";
import heAccountSettingsScreen from "@/app/locales/he/AccountSettingsScreen.json";
import arAccountSettingsScreen from "@/app/locales/ar/AccountSettingsScreen.json";

import enScheduleScreen from "@/app/locales/en/ScheduleScreen.json";
import frScheduleScreen from "@/app/locales/fr/ScheduleScreen.json";
import esScheduleScreen from "@/app/locales/es/ScheduleScreen.json";
import itScheduleScreen from "@/app/locales/it/ScheduleScreen.json";
import heScheduleScreen from "@/app/locales/he/ScheduleScreen.json";
import arScheduleScreen from "@/app/locales/ar/ScheduleScreen.json";


import enSettingsScreen from "@/app/locales/en/SettingsScreen.json";
import frSettingsScreen from "@/app/locales/fr/SettingsScreen.json";
import esSettingsScreen from "@/app/locales/es/SettingsScreen.json";
import itSettingsScreen from "@/app/locales/it/SettingsScreen.json";
import heSettingsScreen from "@/app/locales/he/SettingsScreen.json";
import arSettingsScreen from "@/app/locales/ar/SettingsScreen.json";

import enSupportScreen from "@/app/locales/en/SupportScreen.json";
import frSupportScreen from "@/app/locales/fr/SupportScreen.json";
import esSupportScreen from "@/app/locales/es/SupportScreen.json";
import itSupportScreen from "@/app/locales/it/SupportScreen.json";
import heSupportScreen from "@/app/locales/he/SupportScreen.json";
import arSupportScreen from "@/app/locales/ar/SupportScreen.json";

import enSettingsHeader from "@/app/locales/en/SettingsHeader.json";
import frSettingsHeader from "@/app/locales/fr/SettingsHeader.json";
import esSettingsHeader from "@/app/locales/es/SettingsHeader.json";
import itSettingsHeader from "@/app/locales/it/SettingsHeader.json";
import heSettingsHeader from "@/app/locales/he/SettingsHeader.json";
import arSettingsHeader from "@/app/locales/ar/SettingsHeader.json";

import enSignInScreen from "@/app/locales/en/SignInScreen.json";
import frSignInScreen from "@/app/locales/fr/SignInScreen.json";
import esSignInScreen from "@/app/locales/es/SignInScreen.json";
import itSignInScreen from "@/app/locales/it/SignInScreen.json";
import heSignInScreen from "@/app/locales/he/SignInScreen.json";
import arSignInScreen from "@/app/locales/ar/SignInScreen.json";
import SignInScreen from "..";


/*
 * Define your resources here
 * The key is the language code
 * The value is the JSON object
 * Do this for each screen you have
 * Don't forget to import the JSON files at the top
 * Don't forget to add the new Screen to the ns array in i18n.ts
 */
const resources = {
  en: {
    HomePageScreen: enHomePageScreen,
    HomeMenuScreen: enHomeMenuScreen,
    CampusMap: enCampusMap,
    AccountSettingsScreen: enAccountSettingsScreen,
    ScheduleScreen: enScheduleScreen,
    SettingsScreen: enSettingsScreen,
    SupportScreen: enSupportScreen,
    SettingsHeader: enSettingsHeader,
    SignInScreen: enSignInScreen
  },
  fr: {
    HomePageScreen: frHomePageScreen,
    HomeMenuScreen: frHomeMenuScreen,
    CampusMap: frCampusMap,
    AccountSettingsScreen: frAccountSettingsScreen,
    ScheduleScreen: frScheduleScreen,
    SettingsScreen: frSettingsScreen,
    SupportScreen: frSupportScreen,
    SettingsHeader: frSettingsHeader,
    SignInScreen: frSignInScreen,
  },
  es: {
    HomePageScreen: esHomePageScreen,
    HomeMenuScreen: esHomeMenuScreen,
    CampusMap: esCampusMap,
    AccountSettingsScreen: esAccountSettingsScreen,
    ScheduleScreen: esScheduleScreen,
    SettingsScreen: esSettingsScreen,
    SupportScreen: esSupportScreen,
    SettingsHeader: esSettingsHeader,
    SignInScreen: esSignInScreen,
  },
  it: {
    HomePageScreen: itHomePageScreen,
    HomeMenuScreen: itHomeMenuScreen,
    CampusMap: itCampusMap,
    AccountSettingsScreen: itAccountSettingsScreen,
    ScheduleScreen: itScheduleScreen,
    SettingsScreen: itSettingsScreen,
    SupportScreen: itSupportScreen,
    SettingsHeader: itSettingsHeader,
    SignInScreen: itSignInScreen,
  },
  he: {
    HomePageScreen: heHomePageScreen,
    HomeMenuScreen: heHomeMenuScreen,
    CampusMap: heCampusMap,
    AccountSettingsScreen: heAccountSettingsScreen,
    ScheduleScreen: heScheduleScreen,
    SettingsScreen: heSettingsScreen,
    SupportScreen: heSupportScreen,
    SettingsHeader: heSettingsHeader,
    SignInScreen: heSignInScreen,
  },
  ar: {
    HomePageScreen: arHomePageScreen,
    HomeMenuScreen: arHomeMenuScreen,
    CampusMap: arCampusMap,
    AccountSettingsScreen: arAccountSettingsScreen,
    ScheduleScreen: arScheduleScreen,
    SettingsScreen: arSettingsScreen,
    SupportScreen: arSupportScreen,
    SettingsHeader: arSettingsHeader,
    SignInScreen: arSignInScreen,
  },
};

export default resources;
