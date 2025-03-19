import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface IndoorNavigationHeaderProps {
  testID: string;
}

const IndoorNavigationHeader: React.FC<IndoorNavigationHeaderProps> = ({ testID }) => {
  const { t } = useTranslation("IndoorNavigationHeader");
  const router = useRouter();

  return (
    <View style={styles.background} testID={testID}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.container}>
        {/* Header Title */}
        <Text style={styles.headerTitle}>{t("Indoor Navigation")}</Text>

        {/* Navigation Info */}
        <View style={styles.infoContainer}>
          <FontAwesome5 name="map-marker-alt" size={18} color="#fff" />
          <Text style={styles.infoText}>{t("Find your way inside")}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: 180,
    backgroundColor: "#912338",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  container: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 32,
  },
  infoText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 8,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    padding: 10,
    zIndex: 10,
  },
});

export default IndoorNavigationHeader;
