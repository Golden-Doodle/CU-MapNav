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
};

const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  title = "Unknown Location",
  description = "No description available",
  isFoodLocation = false,
  onPress,
}) => {
  return (
    <Marker coordinate={coordinate} onPress={onPress} tappable={true}>
      {isFoodLocation ? (
        <Image
          source={{ uri: "https://maps.google.com/mapfiles/ms/icons/restaurant.png" }}
          style={styles.foodMarker}
        />
      ) : (
        <Image
          source={{ uri: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} 
          style={styles.defaultMarker}
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
