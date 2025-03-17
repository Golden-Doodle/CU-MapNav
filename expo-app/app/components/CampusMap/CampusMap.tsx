import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";
import CustomMarker from "./CustomMarker";
import { buildings } from "./data/buildingData";
import { getDirections } from "@/app/utils/directions";
import { initialRegion } from "./data/initialRegion";
import { markers } from "./data/customMarkerData";
import NavTab from "./CampusMapNavTab";
import * as Location from "expo-location";
import BuildingInfoModal from "./modals/BuildingInfoModal";
import { getFillColorWithOpacity } from "@/app/utils/helperFunctions";
import NextClassModal from "./modals/NextClassModal";
import HamburgerWidget from "./HamburgerWidget";
import TransitModal from "./modals/TransitModal";
import SearchModal from "./modals/SearchModal";
import { fetchNearbyRestaurants } from "@/app/services/GoogleMap/googlePlacesService";
import { Campus, Coordinates, LocationType, CustomMarkerType, Building, GooglePlace } from "@/app/utils/types";

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
  const [viewEatingOnCampus, setViewEatingOnCampus] = useState<boolean>(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
  const [isTransitModalVisible, setIsTransitModalVisible] = useState<boolean>(false);
  const [restaurantMarkers, setRestaurantMarkers] = useState<CustomMarkerType[]>([]);
  const [mapRegion, setMapRegion] = useState(initialRegion[campus]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getUserLocation = async () => {
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
    };
    getUserLocation();
  }, []);

  // Fetch nearby restaurants when user location is available using Google Places API
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
            name: place.name,
            description: place.vicinity,
            photoUrl: place.photos?.[0]?.imageUrl,
            rating: place.rating,
            campus
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

  const handleMarkerPress = useCallback((marker: CustomMarkerType) => {
    const markerToBuilding: Building = {
      id: marker.id,
      name: marker.name,
      description: marker.description,
      coordinates: [marker.coordinate],
      strokeColor: "blue",
      fillColor: "rgba(0, 0, 255, 0.5)",
      campus: "SGW",
      photoUrl: marker.photoUrl,
      rating: marker.rating,
    };

    setDestination({
      building: markerToBuilding,
      coordinates: marker.coordinate,
      selectedBuilding: true,
    });
    setIsBuildingInfoModalVisible(true);
  }, []);

  const toggleCampus = useCallback(() => {
    setCampus((prevCampus) => {
      const newCampus = prevCampus === "SGW" ? "LOY" : "SGW";
      setMapRegion(initialRegion[newCampus]);
      return newCampus;
    });
  }, []);

  const handleBuildingPressed = (building: Building) => () => {
    if (destination !== null && destination.building?.id === building.id) {
      setDestination(null);
      setIsBuildingInfoModalVisible(false);
      return;
    }

    setDestination({ building, coordinates: building.coordinates[0], selectedBuilding: true });
    setIsBuildingInfoModalVisible(true);

    setMapRegion({
      latitude: building.coordinates[0].latitude,
      longitude: building.coordinates[0].longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

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

  const onDirectionsPress = useCallback(() => {
    setIsTransitModalVisible(true);
  }, []);

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

  const toggleEatingLocations = () => {
    setViewEatingOnCampus((prevState) => !prevState);
  };

  const handleOnUseAsOrigin = () => {
    // This works but shouldnt, must investigate, has to do with the asynchronous nature of the state update
    setOrigin((prevOrigin) => {
      setDestination(prevOrigin);
      return destination;
    });
    setIsBuildingInfoModalVisible(false);
    onDirectionsPress();
  };
  
  // const resetOriginAndDestinationToDefault = () => {
  //   set

  return (
    <View style={styles.container}>
      {/* Movable Hamburger Widget */}
      <HamburgerWidget
        testID="toggle-campus-button"
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
        testID="campus-map"
      >
        {viewCampusMap && (
          <>
            {/* Render Markers */}
            {markers.map((marker) => (
              <CustomMarker
                key={marker.id}
                testID={`building-marker-${marker.id}`}
                coordinate={marker.coordinate}
                name={marker.name}
                description={marker.description}
                onPress={() => handleMarkerPress(marker)}
              />
            ))}

            {/* Conditionally render Restaurant Markers */}
            {viewEatingOnCampus && restaurantMarkers.map((marker) => (
              <CustomMarker
                key={marker.id}
                testID={`restaurant-marker-${marker.id}`}
                coordinate={marker.coordinate}
                name={marker.name}
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
                testID={`building-polygon-${building.id}`}
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
            testID="route-polyline"
          />
        )}

        {/* Render Destination Marker */}
        {destination && !destination.selectedBuilding && (
          <Marker coordinate={destination.coordinates} pinColor="red" title="Destination" testID="destination-marker" />
        )}
      </MapView>

      {/* Show loading spinner if data is being fetched */}
      {isLoading && <ActivityIndicator size="large" color="#912338" style={styles.spinner} testID="loading-spinner" />}

      {/* Modal for Building Info */}
      <BuildingInfoModal
        visible={isBuildingInfoModalVisible}
        onClose={() => setIsBuildingInfoModalVisible(false)}
        selectedBuilding={destination?.building}
        onNavigate={onDirectionsPress}
        onUseAsOrigin={handleOnUseAsOrigin}
        testID="building-info-modal"
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
        testID="search-modal"
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
        testID="transit-modal"
      />

      <NextClassModal
        visible={isNextClassModalVisible}
        onClose={() => setIsNextClassModalVisible(false)}
        destination={destination}
        setDestination={setDestination}
        testID="next-class-modal"
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
        testID="nav-tab"
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