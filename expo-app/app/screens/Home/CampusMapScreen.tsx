import React from "react";
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import CampusMapping from "../../components/CampusMap/CampusMap";

// 1. Import useTranslation and choose the namespace "CampusMapScreen"
import { useTranslation } from "react-i18next";

export default function CampusMapScreen() {
  const router = useRouter();
  const { pressedOptimizeRoute } = useLocalSearchParams();

  // 2. Hook into the "CampusMapScreen" namespace
  const { t } = useTranslation("CampusMapScreen");

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={30} color="#fff" />
          {/* Added label for translation */}
        </TouchableOpacity>

        {/* Placeholder View for symmetry */}
        <View style={{ width: 40 }} />
      </SafeAreaView>

      {/* Map Content */}
      <View style={styles.mapContainer}>
        <CampusMapping pressedOptimizeRoute={pressedOptimizeRoute === "true"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#912338",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#731b2b",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  titleText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  mapContainer: {
    flex: 1,
  },
});
