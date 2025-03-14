import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import styles from "./ButtonSection.styles";
import { useTranslation } from "react-i18next";
export default function ButtonSection() {
  const { t } = useTranslation("HomePageScreen");

  return (
    <View style={styles.container}>
      {/* TODO: Give functionality to buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{t("study_spot")}</Text>
      </TouchableOpacity>
      
      {/* TODO: Give funcationality to buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{t("coffee_stop")}</Text>
      </TouchableOpacity>
    </View>
  );
}
