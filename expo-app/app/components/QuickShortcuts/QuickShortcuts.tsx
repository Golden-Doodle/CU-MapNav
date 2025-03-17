import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const QuickShortcuts = () => {

  const {t} = useTranslation("HomePageScreen");

  return (
    <View style={styles.container} testID="quick-shortcuts-container">
      <TouchableOpacity style={styles.shortcut} testID="food-shortcut">
        <FontAwesome5 name="utensils" size={24} color="#912338" testID="food-icon" />
        <Text style={styles.text}>{t("Food")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.shortcut} testID="bathroom-shortcut">
        <FontAwesome5 name="toilet" size={24} color="#912338" testID="bathroom-icon" />
        <Text style={styles.text}>{t("Bathroom")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.shortcut} testID="bar-shortcut">
        <FontAwesome5 name="cocktail" size={24} color="#912338" testID="bar-icon" />
        <Text style={styles.text}>{t("Bar")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 30,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shortcut: {
    alignItems: "center",
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#912338",
    marginTop: 5,
  },
});

export default QuickShortcuts;
