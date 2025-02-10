import React, { useState, useCallback, useEffect } from "react";
import MapView, { Polygon, Polyline, Marker } from "react-native-maps";
import {
  StyleSheet,
  View,
  Alert,
  Switch,
  Text,
  TouchableOpacity,
} from "react-native";
import CustomMarker from "./CustomMarker";
import { SGWBuildings, LoyolaBuildings } from "../data/buildingData";
import { getDirections } from "../utils/directions";
import { initialRegion, SGWMarkers, LoyolaMarkers } from "./customMarkerData";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import NavTab from "./NavTab";
import * as Location from "expo-location";
import { Building, Coordinates } from "../utils/types";
import ModalComponent from "./modals/BuildingInfoModal";
import { getFillColorWithOpacity } from "../utils/helperFunctions";

const CampusMap = () => {
  const [campus, setCampus] = useState<"SGW" | "Loyola">("SGW");
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [viewCampusMap, setViewCampusMap] = useState<boolean>(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const markers = campus === "SGW" ? SGWMarkers : LoyolaMarkers;
  const buildings = campus === "SGW" ? SGWBuildings : LoyolaBuildings;

  // Get user’s current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to navigate.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Reset destination and route
  const resetDirections = () => {
    setRouteCoordinates([]);
    setDestination(null);
    setSelectedBuilding(null);
  };

  // Fetch route from user's location to destination
  const fetchRoute = useCallback(async () => {
    if (!userLocation) {
      Alert.alert("Cannot fetch route without user location");
      return;
    }

    let targetDestination = destination;

    if (!targetDestination && selectedBuilding) {
      targetDestination = selectedBuilding.coordinates[0];
    }

    if (!targetDestination) {
      Alert.alert("Select a destination point");
      return;
    }

    const route = await getDirections(userLocation, targetDestination);

    if (route) {
      setRouteCoordinates(route);
    }
  }, [userLocation, destination, selectedBuilding]);

  const fetchRouteWithDestination = useCallback(async (destination: Coordinates) => {
    if (!userLocation) {
      Alert.alert("Cannot fetch route without user location");
      return;
    }

    const route = await getDirections(userLocation, destination);

    if (route) {
      setRouteCoordinates(route);
    }
  }, [userLocation]);

  // Handle marker press to set destination
  const handleMarkerPress = useCallback((coordinate: Coordinates) => {
    // console.log("Setting destination:", coordinate);
    setDestination(coordinate);
  }, []);

  // Toggle between SGW and Loyola campuses
  const toggleCampus = useCallback(() => {
    setCampus((prevCampus) => (prevCampus === "SGW" ? "Loyola" : "SGW"));
    resetDirections();
  }, []);

  // Handle building press to show building info
  const handleBuildingPressed = (building: Building) => () => {
    if (selectedBuilding?.id === building.id) {
      setSelectedBuilding(null);
      setIsModalVisible(false);
      return;
    }
    // console.log("Building pressed:", building);
    setSelectedBuilding(building);
    setIsModalVisible(true);
  };

  // Handle directions press
  const onDirectionsPress = useCallback(() => {
    if (selectedBuilding) {
      fetchRouteWithDestination(selectedBuilding.coordinates[0]);
    }
  }, [selectedBuilding, fetchRouteWithDestination]);

  return (
    <View style={styles.container}>
      <View style={styles.topRightContainer}>
        <TouchableOpacity style={styles.buttonContainer} onPress={toggleCampus}>
          <Text style={styles.buttonText}>
            <MaterialIcons name="arrow-upward" size={16} color="black" />
            <MaterialIcons name="arrow-downward" size={16} color="black" />
            View {campus === "SGW" ? "Loyola Campus" : "SGW Campus"}
          </Text>
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>View Campus Map</Text>
          <Switch
            value={viewCampusMap}
            onValueChange={(value) => setViewCampusMap(value)}
          />
        </View>
      </View>

      <MapView
        style={styles.map}
        region={initialRegion[campus]}
        showsUserLocation={true}
        loadingEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* Render Markers */}
        {markers.map((marker) => (
          <CustomMarker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => handleMarkerPress(marker.coordinate)}
          />
        ))}

        {/* Render Polygons */}
        {buildings.map((building) => (
          <Polygon
            key={building.id}
            coordinates={building.coordinates}
            fillColor={getFillColorWithOpacity(building, selectedBuilding)}
            strokeColor={building.strokeColor}
            strokeWidth={2}
            onPress={handleBuildingPressed(building)}
          />
        ))}

        {/* Render Polyline for Route */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}

        {/* Render Destination Marker */}
        {destination && (
          <Marker coordinate={destination} pinColor="red" title="Destination" />
        )}

      </MapView>

      {/* Modal for Building Info */}
      <ModalComponent
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title={selectedBuilding?.name || "Building Information"}
        description={selectedBuilding?.description || "No description available"}
        footerContent={
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => {
              if (selectedBuilding) {
                setDestination({
                  latitude: selectedBuilding.coordinates[0].latitude,
                  longitude: selectedBuilding.coordinates[0].longitude,
                });
                setIsModalVisible(false);
              }
            }}
          >
            <Text style={styles.navigateButtonText}>
              Navigate to this Building
            </Text>
          </TouchableOpacity>
        }
      />

      <NavTab
        campus={campus}
        selectedBuilding={selectedBuilding}
        onNavigatePress={fetchRoute}
        onTravelPress={() => Alert.alert("Travel pressed")}
        onEatPress={() => Alert.alert("Eat on Campus pressed")}
        onNextClassPress={() => Alert.alert("Next Class pressed")}
        onMoreOptionsPress={() => Alert.alert("More Options pressed")}
        onInfoPress={() => setIsModalVisible(true)}
        onBackPress={() => resetDirections()}
        onDirectionsPress={onDirectionsPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  map: { flex: 1 },
  topRightContainer: {
    position: "absolute",
    bottom: 100,
    right: 10,
    zIndex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  buttonContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 14, fontWeight: "bold" },
  switchContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: { marginRight: 5, fontSize: 12, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: "#555",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navigateButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  navigateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CampusMap;
