import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polygon, Polyline, Circle } from "react-native-maps";
import CustomMarker from "./CustomMarker";
import { SGWBuildings, LoyolaBuildings } from "./data/buildingData";
import { getDirections } from "@/app/utils/directions";
import { initialRegion, SGWMarkers, LoyolaMarkers } from "./data/customMarkerData";
import NavTab from "./CampusMapNavTab";
import * as Location from "expo-location";
import BuildingInfoModal from "./modals/BuildingInfoModal";
import { getFillColorWithOpacity } from "@/app/utils/helperFunctions";
import NextClassModal from "./modals/NextClassModal";
import HamburgerWidget from "./HamburgerWidget";
import TransitModal from "./modals/TransitModal";
import SearchModal from "./modals/SearchModal";
import { fetchNearbyRestaurants } from "@/app/services/GoogleMap/googlePlacesService";
import {
  Campus,
  Coordinates,
  LocationType,
  CustomMarkerType,
  Building,
  GooglePlace,
} from "@/app/utils/types";
import RadiusAdjuster from "./RadiusAdjuster";

// Base style to remove all POIs and transit labels
const baseMapStyle = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

// Your dark map style JSON
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

// Build the customMapStyle based on dark mode state
const getCustomMapStyle = (isDarkMode: boolean) =>
  isDarkMode ? [...darkMapStyle, ...baseMapStyle] : baseMapStyle;

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
  const [allRestaurantMarkers, setAllRestaurantMarkers] = useState<CustomMarkerType[]>([]);
  const [mapRegion, setMapRegion] = useState(initialRegion[campus]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number>(100);
  const [isRadiusAdjusterVisible, setIsRadiusAdjusterVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const markers = campus === "SGW" ? SGWMarkers : LoyolaMarkers;
  const buildings = campus === "SGW" ? SGWBuildings : LoyolaBuildings;

  // Haversine formula helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isPointInPolygon = (point: Coordinates, polygon: Coordinates[]) => {
    const { latitude: x, longitude: y } = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].latitude,
            yi = polygon[i].longitude;
      const xj = polygon[j].latitude,
            yj = polygon[j].longitude;
      const intersect = (yi > y) !== (yj > y) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const getPolygonCenter = (polygon: Coordinates[]) => {
    const sum = polygon.reduce((acc, point) => ({
      latitude: acc.latitude + point.latitude,
      longitude: acc.longitude + point.longitude,
    }), { latitude: 0, longitude: 0 });
    return {
      latitude: sum.latitude / polygon.length,
      longitude: sum.longitude / polygon.length,
    };
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to navigate.");
        return;
      }
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setUserLocation(location.coords);
          setOrigin({
            userLocation: true,
            coordinates: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          });
          const foundBuilding = buildings.find((building) =>
            isPointInPolygon(location.coords, building.coordinates)
          );
          setCurrentBuilding(foundBuilding || null);
        }
      );
    })();
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [buildings, campus]);

  useEffect(() => {
    if (!userLocation) {
      const fallbackLocation = { latitude: mapRegion.latitude, longitude: mapRegion.longitude };
      const foundBuilding = buildings.find((building) =>
        isPointInPolygon(fallbackLocation, building.coordinates)
      );
      if (foundBuilding) {
        setCurrentBuilding(foundBuilding);
      }
    }
  }, [userLocation, mapRegion, buildings]);

  useEffect(() => {
    if (userLocation && viewEatingOnCampus) {
      setIsLoading(true);
      fetchNearbyRestaurants(userLocation)
        .then((restaurants) => {
          const markers = restaurants.map((place: GooglePlace) => ({
            id: place.place_id,
            coordinate: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            },
            title: place.name,
            description: place.vicinity,
            photoUrl: place.photos?.[0]?.imageUrl,
            rating: place.rating,
          }));
          setAllRestaurantMarkers(markers);
        })
        .catch((error) => {
          console.error("Error fetching nearby restaurants: ", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userLocation, viewEatingOnCampus]);

  useEffect(() => {
    if (userLocation && allRestaurantMarkers.length > 0) {
      const filteredMarkers = allRestaurantMarkers.filter((marker) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          marker.coordinate.latitude,
          marker.coordinate.longitude
        );
        return distance <= selectedDistance;
      });
      setRestaurantMarkers(filteredMarkers);
    }
  }, [selectedDistance, userLocation, allRestaurantMarkers]);

  const handleMarkerPress = useCallback((marker: CustomMarkerType) => {
    const markerToBuilding: Building = {
      id: marker.id,
      name: marker.title,
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
    setDestination({
      building,
      coordinates: building.coordinates[0],
      selectedBuilding: true,
    });
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

  // Build the custom style by combining base style with darkMapStyle if dark mode is enabled.
  const customMapStyle = getCustomMapStyle(isDarkMode);

  return (
    <View style={styles.container}>
      <HamburgerWidget
        testID="toggle-campus-button"
        toggleCampus={toggleCampus}
        viewCampusMap={viewCampusMap}
        setViewCampusMap={setViewCampusMap}
        campus={campus}
        darkMode={isDarkMode}
        onDarkModeChange={setIsDarkMode}
      />

      <MapView
        style={styles.map}
        region={mapRegion}
        customMapStyle={customMapStyle}
        showsUserLocation={true}
        loadingEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        onLongPress={(event: any) => handleMapPress(event)}
        testID="campus-map"
      >
        {viewCampusMap && (
          <>
            {viewEatingOnCampus && userLocation && (
              <>
                <Circle
                  center={userLocation}
                  radius={selectedDistance}
                  strokeColor="rgba(145,35,56,0.5)"
                  fillColor="rgba(145,35,56,0.2)"
                  zIndex={1000}
                />
                {restaurantMarkers.map((marker) => (
                  <CustomMarker
                    key={marker.id}
                    testID={`restaurant-marker-${marker.id}`}
                    coordinate={marker.coordinate}
                    title={marker.title}
                    description={marker.description}
                    isFoodLocation={true}
                    onPress={() => handleMarkerPress(marker)}
                  />
                ))}
              </>
            )}
            {buildings.map((building) => (
              <Polygon
                key={building.id}
                coordinates={building.coordinates}
                fillColor={
                  currentBuilding && currentBuilding.id === building.id
                    ? "rgb(255, 0, 47)"
                    : getFillColorWithOpacity(building, destination)
                }
                strokeColor={
                  isDarkMode
                    ? "#fff"
                    : currentBuilding && currentBuilding.id === building.id
                    ? "rgb(0, 0, 0)"
                    : building.strokeColor
                }
                strokeWidth={2}
                tappable={true}
                onPress={handleBuildingPressed(building)}
                testID={`building-marker-${building.id}-marker`}
              />
            ))}
          </>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="rgba(145, 35, 56, 1)"
            testID="route-polyline"
          />
        )}

        {destination && !destination.selectedBuilding && (
          <Marker
            coordinate={destination.coordinates}
            pinColor="red"
            title="Destination"
            testID="destination-marker"
          />
        )}
      </MapView>

      {viewEatingOnCampus && (
        <TouchableOpacity
          style={styles.radiusButton}
          onPress={() => setIsRadiusAdjusterVisible(true)}
        >
          <Text style={styles.radiusButtonText}>Adjust Search Radius</Text>
        </TouchableOpacity>
      )}

      {isLoading && (
        <ActivityIndicator
          size="large"
          color="rgba(145,35,56,1)"
          style={styles.spinner}
          testID="loading-spinner"
        />
      )}

      <BuildingInfoModal
        visible={isBuildingInfoModalVisible}
        onClose={() => setIsBuildingInfoModalVisible(false)}
        selectedBuilding={destination?.building}
        onNavigate={onDirectionsPress}
        testID="building-info-modal"
      />

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

      {currentBuilding && (
        <View style={styles.buildingTextContainer}>
          <Text style={styles.buildingText}>I'm inside {currentBuilding.name}</Text>
        </View>
      )}

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

      <RadiusAdjuster
        visible={isRadiusAdjusterVisible}
        initialValue={selectedDistance}
        onApply={(value) => setSelectedDistance(value)}
        onReset={() => setSelectedDistance(100)}
        onClose={() => setIsRadiusAdjusterVisible(false)}
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
  buildingTextContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    width: "100%",
    backgroundColor: "rgba(128,128,128,0.7)",
    padding: 10,
    alignItems: "center",
    zIndex: 1500,
  },
  buildingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  radiusButton: {
    position: "absolute",
    bottom: 160,
    left: 10,
    right: 10,
    backgroundColor: "rgba(145,35,56,1)",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 2100,
    elevation: 5,
  },
  radiusButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CampusMap;
