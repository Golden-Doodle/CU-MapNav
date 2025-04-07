import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import styles from "./ButtonSection.styles";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

export default function ButtonSection() {
  const router = useRouter();
  const { t } = useTranslation("HomePageScreen");

  const onCoffeeStopPress = () => {
    router.push({
      pathname: "/screens/Home/CampusMapScreen",
      params: {
        pressedCoffeeStop: "true",
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* TODO: Give functionality to buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{t("Study Spot")}</Text>
      </TouchableOpacity>

      {/* TODO: Give funcationality to buttons */}
      <TouchableOpacity style={styles.button} onPress={onCoffeeStopPress} testID="coffee-stop-button">
        <Text style={styles.buttonText}>{t("Coffee Stop")}</Text>
      </TouchableOpacity>
    </View>
  );
}
