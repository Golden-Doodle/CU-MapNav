import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import supportedLanguages from "@/app/config/supportedLanguages";
import { FontAwesome5 } from "@expo/vector-icons";

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem("language");
      if (storedLang) {
        setSelectedLanguage(storedLang);
        i18n.changeLanguage(storedLang);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang: string) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    await AsyncStorage.setItem("language", lang);
  };

  const selectedLanguageLabel =
    supportedLanguages.find((lang) => lang.code === selectedLanguage)?.label || "English";

  return (
    <View style={styles.settingOption}>
      <FontAwesome5 name="language" size={18} color="#912338" />
      <Picker selectedValue={selectedLanguage} onValueChange={changeLanguage} style={styles.picker}>
        {supportedLanguages.map((lang) => (
          <Picker.Item key={lang.code} label={lang.label} value={lang.code} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  settingOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  picker: {
    flex: 1,
    color: "#912338",
  },
});

export default LanguageSelector;
