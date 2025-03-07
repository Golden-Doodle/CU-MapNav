import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

// 1) Import useTranslation and specify the "HomeMenuScreen" namespace
import { useTranslation } from "react-i18next";

export default function HomeMenuScreen() {
  const router = useRouter();

  // 2) Hook into the "HomeMenuScreen" namespace
  const { t } = useTranslation("HomeMenuScreen");

  return (
    <View style={styles.container}>
      {/* Back Button in the Top-Left Corner (icon only, no text) */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Menu Title */}
      <Text style={styles.title}>{t("menu_title")}</Text>

      {/* Navigation Options */}
      <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.8}
        onPress={() => router.push("/screens/Home/CampusMapScreen")}
      >
        {/* We keep the emoji, but the text itself is translated */}
        <Text style={styles.menuText}>📍 {t("campus_map")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.8}
        onPress={() => router.push("/screens/Chatbot/ChatBotScreen")}
      >
        <Text style={styles.menuText}>💬 {t("chatbot")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.8}
        onPress={() => router.push("/screens/Shuttle/ShuttleScreen")}
      >
        <Text style={styles.menuText}>🚌 {t("shuttle_schedule")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.8}
        onPress={() => router.push("/screens/Home/StudySpotsScreen")}
      >
        <Text style={styles.menuText}>📖 {t("study_spots")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#912338",
    paddingVertical: 60,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 55,
    left: 15,
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
    letterSpacing: 1,
  },
  menuItem: {
    width: "85%",
    paddingVertical: 18,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  menuText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#912338",
    letterSpacing: 0.5,
  },
});
