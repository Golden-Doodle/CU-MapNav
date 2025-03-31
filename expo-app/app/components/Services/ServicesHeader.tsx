import React from "react";
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface ServicesHeaderProps {
  testID: string;
}

const ServicesHeader: React.FC<ServicesHeaderProps> = ({ testID }) => {
  const { t } = useTranslation("ServicesHeader");
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../../assets/images/header-background.jpg")}
      style={styles.background}
      testID={testID}
    >
      {/* Dark Overlay to Improve Text Readability */}
      <View style={styles.overlay} />

      {/* Back Arrow Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.container}>
        {/* Header Title */}
        <Text style={styles.reportTitle}>{t("Services")}</Text>

        {/* Informational Notice */}
        <View style={styles.noticeContainer}>
          <FontAwesome5 name="info-circle" size={18} color="#912338" />
          <Text style={styles.noticeText}>{t("Select a service to get started.")}</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    alignItems: "center",
  },
  reportTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  noticeText: {
    fontSize: 15,
    color: "#912338",
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

export default ServicesHeader;
