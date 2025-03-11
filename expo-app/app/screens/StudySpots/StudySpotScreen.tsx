import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function StudySpots() {
  const router = useRouter();

  return (
    <View style={styles.container} testID="study-spots-container">
      <Text style={styles.title} testID="study-spots-title">Study Spots</Text>
      <Text style={styles.infoText} testID="study-spots-info-text">Nearby study spots will be displayed here.</Text>
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()} 
        testID="back-button"
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#912338",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  backButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#912338",
    borderRadius: 5,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
});