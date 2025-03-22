import React from "react";
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import CampusMap from "../../components/CampusMap/CampusMap";

export default function CampusMapScreen() {
  const router = useRouter();
  const { pressedOptimizeRoute } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={30} color="#fff" />
        </TouchableOpacity>
        {/* Placeholder for symmetry */}
        <View style={{ width: 40 }} />
      </SafeAreaView>

      {/* Outdoor Campus Map Content */}
      <View style={styles.mapContainer}>
        <CampusMap pressedOptimizeRoute={pressedOptimizeRoute === "true"} />
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
  mapContainer: {
    flex: 1,
  },
});