import React from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import ServicesHeader from "../../components/Services/ServicesHeader"; // Create this component similar to SettingsHeader
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

export default function ServicesScreen() {
  return (
    <View style={styles.container}>
      {/* Services Header */}
      <ServicesHeader testID="services-header" />

      {/* Scrollable Services List */}
      <ScrollView contentContainerStyle={styles.servicesList} testID="services-list">
        {/* Library */}
        <TouchableOpacity
          style={styles.serviceOption}
          onPress={() => console.log("Library pressed")}
          testID="library-button"
        >
          <FontAwesome5 name="book" size={18} color="#912338" />
          <Text style={styles.serviceText}>Library</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#912338" />
        </TouchableOpacity>

        {/* Emergency Services */}
        <TouchableOpacity
          style={[styles.serviceOption, styles.emergency]}
          onPress={() => console.log("Emergency Services pressed")}
          testID="emergency-button"
        >
          <FontAwesome5 name="exclamation-triangle" size={18} color="red" />
          <Text style={[styles.serviceText, { color: "red" }]}>Emergency Services</Text>
          <FontAwesome5 name="chevron-right" size={16} color="red" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation testID="bottom-navigation" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  servicesList: {
    paddingVertical: 15,
  },
  serviceOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginLeft: 10,
    color: "#912338",
  },
  emergency: {
    marginTop: 5,
  },
});
