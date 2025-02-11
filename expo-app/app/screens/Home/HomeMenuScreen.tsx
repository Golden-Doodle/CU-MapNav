import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

export default function HomeMenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back Button in the Top-Left Corner */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Menu</Text>

      {/* Navigation Options */}
      <TouchableOpacity 
        style={styles.menuItem} 
        activeOpacity={0.8} 
        onPress={() => router.push("/screens/Home/CampusMapScreen")}
      >
        <Text style={styles.menuText}>📍 Campus Map</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        activeOpacity={0.8} 
        onPress={() => router.push("/screens/Home/CampusMapScreen")}
      >
        <Text style={styles.menuText}>🚌 Shuttle Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        activeOpacity={0.8} 
        onPress={() => router.push("/screens/Home/StudySpotsScreen")}
      >
        <Text style={styles.menuText}>📖 Study Spots</Text>
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
    top: 55, // Adjust as needed for safe area
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
