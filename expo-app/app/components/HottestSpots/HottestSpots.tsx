import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; // Flame icon
import { useTranslation } from "react-i18next";

const HottestSpots = () => {

  const {t} = useTranslation("HomePageScreen");

  return (
    <View style={styles.container}>
      {/* Flame Icon */}
      <FontAwesome5 name="fire" size={24} color="#912338" />

      {/* Title */}
      <Text style={styles.text}>
        {t("concordia_s_hottest_spots_of_the_week_will_show_up_here")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 5,
    textAlign: "center",
  },
});

export default HottestSpots;
