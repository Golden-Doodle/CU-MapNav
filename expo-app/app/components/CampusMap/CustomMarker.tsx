import React from "react";
import { Marker, Callout } from "react-native-maps";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; 

type CustomMarkerProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  isFoodLocation?: boolean; 
  onPress?: () => void;
};

const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  title = "Unknown Location",
  description = "No description available",
  isFoodLocation = false,
  onPress,
}) => (
  <Marker coordinate={coordinate} onPress={onPress} testID="marker">
    <View
      style={[styles.marker, isFoodLocation && styles.foodMarker]}
      testID={isFoodLocation ? "food-marker" : "default-marker"}
    >
      {isFoodLocation ? (
        <MaterialIcons name="restaurant" size={20} color="white" />
      ) : (
        <Text style={styles.markerText}>{title[0] || "?"}</Text>
      )}
    </View>
    <Callout testID="callout"> 
      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>
          {title} {isFoodLocation ? "🍽" : ""}
        </Text>
        <Text>{description}</Text>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={() => {
            if (onPress) {
              onPress();
            } else {
              Alert.alert("Navigation", "Navigate to this location");
            }
          }}
          testID="navigate-button" 
        >
          <Text style={styles.navigateButtonText}>Navigate Here</Text>
        </TouchableOpacity>
      </View>
    </Callout>
  </Marker>

);

const styles = StyleSheet.create({
  marker: {
    backgroundColor: "blue",
    padding: 8,
    borderRadius: 20,
    borderColor: "white",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  foodMarker: {
    backgroundColor: "red", 
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
  },
  callout: {
    width: 160,
    padding: 5,
  },
  calloutTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  navigateButton: {
    marginTop: 10,
    backgroundColor: "#912338",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  navigateButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CustomMarker;
