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
  isFoodLocation?: boolean;
  onPress?: () => void;
  testID: string; 
};

const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  title = "Unknown Location",
  description = "No description available",
  isFoodLocation = false,
  onPress,
  testID,
}) => {
  return (
    <Marker coordinate={coordinate} onPress={onPress} tappable={true} testID={`${testID}-marker`}>
      {isFoodLocation ? (
        <Image
          source={require("@/assets/images/restaurant-marker.png")}
          style={[styles.foodMarker, { tintColor: "#912338" }]}
          testID={`${testID}-food-marker`}
        />
      ) : (
        <Image
          source={require("@/assets/images/map-marker.png")}
          style={[styles.defaultMarker, { tintColor: "#912338" }]}
          testID={`${testID}-default-marker`}
        />
      )}
    </Marker>
  );
};

const styles = StyleSheet.create({
  foodMarker: {
    width: 40,
    height: 40,
  },
  defaultMarker: {
    width: 40,
    height: 40,
  },
});

export default CustomMarker;