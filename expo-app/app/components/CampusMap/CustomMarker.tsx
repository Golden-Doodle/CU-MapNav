import React from "react";
import { Marker } from "react-native-maps";
import { StyleSheet, Image } from "react-native";

type CustomMarkerProps = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  /**
   * Marker type determines which icon to use.
   * Options: "restaurant", "cafe", "washroom", or "default"
   */
  markerType?: "restaurant" | "cafe" | "washroom" | "default";
  onPress?: () => void;
  testID: string;
};

const getMarkerImage = (markerType: "restaurant" | "cafe" | "washroom" | "default" = "default") => {
  switch (markerType) {
    case "restaurant":
      return require("@/assets/images/restaurant-marker.png");
    case "cafe":
      return require("@/assets/images/cafe-marker.png");
    case "washroom":
      return require("@/assets/images/washroom-marker.png");
    default:
      return require("@/assets/images/map-marker.png");
  }
};

const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  title = "Unknown Location",
  description = "No description available",
  markerType = "default",
  onPress,
  testID,
}) => {
  return (
    <Marker coordinate={coordinate} onPress={onPress} tappable={true} testID={`${testID}-marker`}>
      <Image
        source={getMarkerImage(markerType)}
        style={[styles.marker, { tintColor: "#912338" }]}
        testID={`${testID}-${markerType}-marker`}
      />
    </Marker>
  );
};

const styles = StyleSheet.create({
  marker: {
    width: 40,
    height: 40,
  },
});

export default CustomMarker;