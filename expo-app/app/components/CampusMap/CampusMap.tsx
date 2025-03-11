import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";
import CustomMarker from "./CustomMarker";
import { SGWBuildings, LoyolaBuildings } from "./data/buildingData";
import { getDirections } from "../../utils/directions";  // Ensure this utility function is correctly imported
import { initialRegion, SGWMarkers, LoyolaMarkers } from "./data/customMarkerData";
import NavTab from "./CampusMapNavTab";
import * as Location from "expo-location";
import BuildingInfoModal from "./modals/BuildingInfoModal";
import { getFillColorWithOpacity } from "../../utils/helperFunctions";
import NextClassModal from "./modals/NextClassModal";
import HamburgerWidget from "./HamburgerWidget";
import TransitModal from "./modals/TransitModal";
import SearchModal from "./modals/SearchModal";
import { fetchNearbyRestaurants } from "../../services/GoogleMap/googlePlacesService";
import { Campus, Coordinates, LocationType, CustomMarkerType, Building, GooglePlace } from "../../utils/types";

interface CampusMapProps {
  pressedOptimizeRoute: boolean;
}

const CampusMap = ({ pressedOptimizeRoute = false }: CampusMapProps) => {
  const [campus, setCampus] = useState<Campus>("SGW");
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<LocationType>(null);
  const [origin, setOrigin] = useState<LocationType>(null);
  const [viewCampusMap, setViewCampusMap] = useState<boolean>(true);
  const [isBuildingInfoModalVisible, setIsBuildingInfoModalVisible] = useState<boolean>(false);
  const [isNextClassModalVisible, setIsNextClassModalVisible] = useState<boolean>(false);
  const [viewEatingOnCampus, setViewEatingOnCampus] = useState<boolean>(false); // State to toggle eating locations
  const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
  const [isTransitModalVisible, setIsTransitModalVisible] = useState<boolean>(false);
  const [restaurantMarkers, setRestaurantMarkers] = useState<CustomMarkerType[]>([]); // Store nearby restaurant markers
  const [mapRegion, setMapRegion] = useState(initialRegion[campus]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // New loading state

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
      setUserLocation(location.coords);
      setOrigin({
        userLocation: true,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
    })();
  }, []);

  // Fetch nearby restaurants using the fetchNearbyRestaurants function
  useEffect(() => {
    if (userLocation && viewEatingOnCampus) {
      setIsLoading(true);
      fetchNearbyRestaurants(userLocation)
        .then((restaurants) => {
          const restaurantMarkers = restaurants.map((place: GooglePlace) => ({
            id: place.place_id,
            coordinate: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            },
            title: place.name,
            description: place.vicinity,
            photoUrl: place.photos?.[0]?.imageUrl, // Ensure photoUrl is available
            rating: place.rating, // Restaurant rating
          }));
          setRestaurantMarkers(restaurantMarkers);
        })
        .catch((error) => {
          console.error("Error fetching nearby restaurants: ", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userLocation, viewEatingOnCampus]);

  // Handle marker press to set destination
  const handleMarkerPress = useCallback((marker: CustomMarkerType) => {
    const markerToBuilding: Building = {
      id: marker.id,
      name: marker.title,
      description: marker.description,
      coordinates: [marker.coordinate],
      strokeColor: "blue",
      fillColor: "rgba(0, 0, 255, 0.5)",
      campus: "SGW",
      photoUrl: marker.photoUrl,  // Pass photoUrl for restaurant markers
      rating: marker.rating,      // Pass rating for restaurant markers
    };

    setDestination({
      building: markerToBuilding,
      coordinates: marker.coordinate,
      selectedBuilding: true,
    });
    setIsBuildingInfoModalVisible(true);  // Open the modal
  }, []);

  // Toggle between SGW and Loyola campuses
  const toggleCampus = useCallback(() => {
    setCampus((prevCampus) => {
      const newCampus = prevCampus === "SGW" ? "LOY" : "SGW";
      setMapRegion(initialRegion[newCampus]);
      return newCampus;
    });
  }, []);

  // Handle building press to show building info
  const handleBuildingPressed = (building: Building) => () => {
    if (destination !== null && destination.building?.id === building.id) {
      setDestination(null);
      setIsBuildingInfoModalVisible(false);
      return;
    }

    setDestination({ building, coordinates: building.coordinates[0], selectedBuilding: true });
    setIsBuildingInfoModalVisible(true);

    // Update map region to center on the selected building
    setMapRegion({
      latitude: building.coordinates[0].latitude, // Adjust to building center
      longitude: building.coordinates[0].longitude,
      latitudeDelta: 0.005, // Zoom level
      longitudeDelta: 0.005,
    });
  };

  // Fetch route from user's location to destination
  const fetchRoute = useCallback(async () => {
    if (!origin) {
      Alert.alert("Cannot fetch route without a starting location");
      return;
    }

    if (!destination) {
      Alert.alert("Select a destination point");
      return;
    }

    const route = await getDirections(origin.coordinates, destination.coordinates);

    if (route) {
      setRouteCoordinates(route);
    }
  }, [origin, destination]);

  // Handle directions press
  const onDirectionsPress = useCallback(() => {
    // Set Origin to user location
    setIsTransitModalVisible(true);
  }, []);
  
  // Handle map press to select destination
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const coordinates: Coordinates = { latitude, longitude };
    setDestination({ coordinates } as LocationType);
  };
  const onTravelPress = () => {
    const coordinates: Coordinates = initialRegion[campus];
    setDestination({ coordinates, campus } as LocationType);
    setIsTransitModalVisible(true);
  };

  // Toggle eating locations visibility
  const toggleEatingLocations = () => {
    setViewEatingOnCampus((prevState) => !prevState);
  };

  return (
    <View style={styles.container}>
      {/* Movable Hamburger Widget */}
      <HamburgerWidget
        toggleCampus={toggleCampus}
        viewCampusMap={viewCampusMap}
        setViewCampusMap={setViewCampusMap}
        campus={campus}
      />

      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        loadingEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        onLongPress={(event: any) => handleMapPress(event)}
      >
        {viewCampusMap && (
          <>
            {/* Render Markers */}
            {markers.map((marker) => (
              <CustomMarker
                key={marker.id}
                coordinate={marker.coordinate}
                title={marker.title}
                description={marker.description}
                onPress={() => handleMarkerPress(marker)}
              />
            ))}

            {/* Conditionally render Restaurant Markers */}
            {viewEatingOnCampus && restaurantMarkers.map((marker) => (
              <CustomMarker
                key={marker.id}
                coordinate={marker.coordinate}
                title={marker.title}
                description={marker.description}
                isFoodLocation={true}
                onPress={() => handleMarkerPress(marker)}
              />
            ))}

            {/* Render Polygons (Buildings) */}
            {buildings.map((building) => (
              <Polygon
                key={building.id}
                coordinates={building.coordinates}
                fillColor={getFillColorWithOpacity(building, destination)}
                strokeColor={building.strokeColor}
                strokeWidth={2}
                tappable={true}
                onPress={handleBuildingPressed(building)}
              />
            ))}
          </>
        )}

        {/* Render Polyline for Route */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="rgba(145, 35, 56, 1)"
          />
        )}
        {/* Render Destination Marker */}
        {destination && !destination.selectedBuilding && (
          <Marker coordinate={destination.coordinates} pinColor="red" title="Destination" />
        )}
      </MapView>

      {/* Show loading spinner if data is being fetched */}
      {isLoading && <ActivityIndicator size="large" color="#912338" style={styles.spinner} />}

      {/* Modal for Building Info */}
      <BuildingInfoModal
        visible={isBuildingInfoModalVisible}
        onClose={() => setIsBuildingInfoModalVisible(false)}
        selectedBuilding={destination?.building}
        onNavigate={onDirectionsPress}
      />

      {/* Search Modal */}
      <SearchModal
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onSelectLocation={(building) => {
          setDestination({
            coordinates: building.coordinates[0],
            building,
            campus: building.campus,
          });
          setIsSearchModalVisible(false);
        }}
        onPressSelectOnMap={() => setIsSearchModalVisible(false)}
        destination={destination}
        onGetDirections={() => fetchRoute()}
        buildingData={buildings}
        markerData={markers}
      />

      {/* Transit Modal */}
      <TransitModal
        onClose={() => setIsTransitModalVisible(false)}
        visible={isTransitModalVisible}
        origin={origin}
        destination={destination}
        setOrigin={setOrigin}
        setDestination={setDestination}
        setRouteCoordinates={setRouteCoordinates}
        buildingData={buildings}
        markerData={markers}
        userLocation={userLocation}
      />

      <NextClassModal
        visible={isNextClassModalVisible}
        onClose={() => setIsNextClassModalVisible(false)}
        destination={destination}
        setDestination={setDestination}
      />

      <NavTab
        campus={campus}
        destination={destination}
        onSearchPress={() => setIsSearchModalVisible(true)}
        onTravelPress={onTravelPress}
        onEatPress={toggleEatingLocations}
        onNextClassPress={() => setIsNextClassModalVisible(true)}
        onMoreOptionsPress={() => Alert.alert("More Options pressed")}
        onInfoPress={() => setIsBuildingInfoModalVisible(true)}
        onBackPress={() => setDestination(null)}
        onDirectionsPress={onDirectionsPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  map: { flex: 1 },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -25,
    marginTop: -25,
  },
});

export default CampusMap;
