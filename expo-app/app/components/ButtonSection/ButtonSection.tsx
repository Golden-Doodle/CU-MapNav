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
        <Text style={styles.buttonText}>{t("Study Spot")}</Text>
      </TouchableOpacity>
      
      {/* TODO: Give funcationality to buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{t("Coffee Stop")}</Text>
      </TouchableOpacity>
    </View>
  );
}
