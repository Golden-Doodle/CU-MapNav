import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";
import MapView, { Polygon, Polyline, Circle } from "react-native-maps";
import CustomMarker from "./CustomMarker";
import { SGWBuildings, LoyolaBuildings } from "./data/buildingData";
import { getDirections } from "@/app/utils/directions";
import { initialRegion, SGWMarkers, LoyolaMarkers } from "./data/customMarkerData";
import NavTab from "./CampusMapNavTab";
import * as Location from "expo-location";
import BuildingInfoModal from "./modals/BuildingInfoModal";
import NextClassModal from "./modals/NextClassModal";
import HamburgerWidget from "./HamburgerWidget";
import TransitModal from "./modals/TransitModal";
import SearchModal from "./modals/SearchModal";
import FilterModal, { defaultFilters } from "./modals/FilterModal";
import { fetchNearbyPlaces } from "@/app/services/GoogleMap/googlePlacesService";
import {
  Campus,
  Coordinates,
  LocationType,
  CustomMarkerType,
  Building,
  GooglePlace,
} from "@/app/utils/types";
import { useTranslation } from "react-i18next";
import RadiusAdjuster from "./RadiusAdjuster";
import { getCustomMapStyle } from "./styles/MapStyles";
import { calculateDistance, isPointInPolygon } from "@/app/utils/MapUtils";
import { getFillColorWithOpacity } from "@/app/utils/helperFunctions";
import IndoorMap from "@/app/components/IndoorNavigation/IndoorMap";

interface CampusMapProps {
  pressedOptimizeRoute?: boolean;
  pressedSearch?: boolean;
}

const CampusMap = ({ pressedOptimizeRoute = false, pressedSearch = false }: CampusMapProps) => {
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
  const [fetchedPlaceResults, setFetchedPlaceResults] = useState<CustomMarkerType[]>([]);
  const [visiblePlaceMarkers, setVisiblePlaceMarkers] = useState<CustomMarkerType[]>([]);
  const [mapRegion, setMapRegion] = useState(initialRegion[campus]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number>(100);
  const [isRadiusAdjusterVisible, setIsRadiusAdjusterVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isIndoorMapVisible, setIsIndoorMapVisible] = useState<boolean>(false);

  const [activeFilters, setActiveFilters] = useState<string[]>(defaultFilters);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);

  const markers = campus === "SGW" ? SGWMarkers : LoyolaMarkers;
  const buildings = campus === "SGW" ? SGWBuildings : LoyolaBuildings;

  const { t } = useTranslation("CampusMap");

  useEffect(() => {
    let subscription: Location.LocationSubscription;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("Permission Denied"), t("Allow location access to navigate."));
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
  }, [buildings, campus, t]);

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
    if (userLocation && viewEatingOnCampus && activeFilters.length > 0) {
      setIsLoading(true);
      Promise.all(
        activeFilters.map((filter) =>
          fetchNearbyPlaces(userLocation, filter as "restaurant" | "cafe" | "washroom")
        )
      )
        .then((results) => {
          const markers = results.flatMap((places, index) =>
            places.map((place: GooglePlace) => ({
              id: place.place_id + "_" + activeFilters[index],
              coordinate: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              },
              title: place.name,
              description: place.vicinity,
              photoUrl: place.photos?.[0]?.imageUrl,
              rating: place.rating,
              campus,
              markerType: activeFilters[index] as "restaurant" | "cafe" | "washroom",
            }))
          );
          setFetchedPlaceResults(markers);
        })
        .catch((error) => {
          console.error("Error fetching nearby places: ", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userLocation, viewEatingOnCampus, campus, activeFilters]);

  useEffect(() => {
    if (userLocation && fetchedPlaceResults.length > 0) {
      const filteredMarkers = fetchedPlaceResults.filter((marker) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          marker.coordinate.latitude,
          marker.coordinate.longitude
        );
        return distance <= selectedDistance;
      });
      setVisiblePlaceMarkers(filteredMarkers);
    }
  }, [selectedDistance, userLocation, fetchedPlaceResults]);

  useEffect(() => {
    // Allows for routing from HomePageScreen to CampusMapScreen
    if (pressedOptimizeRoute) {
      setIsNextClassModalVisible(true);
    } else if (pressedSearch) {
      setIsSearchModalVisible(true);
    }
  }, [pressedOptimizeRoute, pressedSearch]);

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
      Alert.alert(t("Cannot fetch route without a starting location"));
      return;
    }
    if (!destination) {
      Alert.alert(t("Select a destination point"));
      return;
    }
    const route = await getDirections(origin.coordinates, destination.coordinates);
    if (route) {
      setRouteCoordinates(route);
    }
  }, [origin, destination, t]);

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

  const customMapStyle = getCustomMapStyle(isDarkMode);

  const handleOnUseAsOrigin = () => {
    const prevOrigin = origin;
    const prevDestination = destination;

    setOrigin(prevDestination);
    setDestination(prevOrigin);

    setIsBuildingInfoModalVisible(false);
    onDirectionsPress();
  };

  const handleNavTabBackPress = () => {
    setRouteCoordinates([]);
    if (userLocation) {
      setOrigin({
        userLocation: true,
        coordinates: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      });
    }
    setDestination(null);
  };

  const handleGoIndoor = () => {
    if (destination && destination.building) {
      const indoorCapableBuildings = ["H", "MB", "JMSB"];
      if (indoorCapableBuildings.includes(destination.building.id)) {
        setIsIndoorMapVisible(true);
      } else {
        Alert.alert("Indoor Map Not Available", "Indoor map is not available for this building.");
      }
    } else {
      Alert.alert(
        "No Building Selected",
        "Please select a building for which indoor directions can be provided."
      );
    }
  };

  return (
    <View style={styles.container}>
      <HamburgerWidget
        testID="toggle-campus-button-hamburger-button"
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
        onLongPress={handleMapPress}
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
                {visiblePlaceMarkers.map((marker) => (
                  <CustomMarker
                    key={marker.id}
                    testID={`place-marker-${marker.id}`}
                    coordinate={marker.coordinate}
                    title={marker.title}
                    description={marker.description}
                    markerType={marker.markerType || "default"}
                    onPress={() => handleMarkerPress(marker)}
                  />
                ))}
              </>
            )}
            {buildings.map((building: Building) => (
              <Polygon
                key={building.id}
                coordinates={building.coordinates}
                fillColor={getFillColorWithOpacity(
                  building,
                  currentBuilding,
                  destination?.selectedBuilding ? destination.building : null
                )}
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
          <CustomMarker
            testID="destination-marker-marker"
            coordinate={destination.coordinates}
            title="Destination"
            description="Destination"
            markerType="default"
          />
        )}
      </MapView>

      {viewEatingOnCampus && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => setIsRadiusAdjusterVisible(true)}
          >
            <Text style={styles.bottomButtonText}>Adjust Search Radius</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Text style={styles.bottomButtonText}>Filter Places</Text>
          </TouchableOpacity>
        </View>
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
        onUseAsOrigin={handleOnUseAsOrigin}
        testID="building-info-modal-content"
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
        testID="transit-modal-modal"
      />

      <NextClassModal
        visible={isNextClassModalVisible}
        onClose={() => setIsNextClassModalVisible(false)}
        destination={destination}
        setDestination={setDestination}
        testID="next-class-modal-overlay"
      />

      {routeCoordinates.length > 0 &&
        destination &&
        destination.building &&
        currentBuilding &&
        currentBuilding.id === destination.building.id && (
          <TouchableOpacity
            style={styles.indoorButton}
            onPress={handleGoIndoor}
            testID="indoor-button"
          >
            <Text style={styles.indoorButtonText}>Go Indoor Directions</Text>
          </TouchableOpacity>
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
        onBackPress={handleNavTabBackPress}
        onDirectionsPress={onDirectionsPress}
        testID="nav-tab"
      />

      <RadiusAdjuster
        visible={isRadiusAdjusterVisible}
        initialValue={selectedDistance}
        onApply={(value) => setSelectedDistance(value)}
        onReset={() => setSelectedDistance(100)}
        onClose={() => setIsRadiusAdjusterVisible(false)}
        testID="radius-adjuster"
      />

      <Modal
        visible={isIndoorMapVisible}
        animationType="slide"
        onRequestClose={() => setIsIndoorMapVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <IndoorMap
            indoorBuildingId={destination?.building?.id}
            destinationRoom={destination?.room}
          />
          <TouchableOpacity
            onPress={() => setIsIndoorMapVisible(false)}
            style={styles.closeIndoorMapButton}
            testID="indoor-map-close-button"
          >
            <Text style={styles.closeButtonText}>Close Indoor Map</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <FilterModal
        visible={isFilterModalVisible}
        onApply={(filters) => {
          setActiveFilters(filters);
          setIsFilterModalVisible(false);
        }}
        onClose={() => setIsFilterModalVisible(false)}
        testID="filter-modal"
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
  bottomButtonContainer: {
    position: "absolute",
    bottom: 120,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
    zIndex: 2100,
    elevation: 5,
  },
  bottomButton: {
    backgroundColor: "rgba(145,35,56,1)",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  bottomButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  indoorButton: {
    position: "absolute",
    bottom: 120,
    left: 10,
    right: 10,
    backgroundColor: "#912338",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 2200,
    elevation: 5,
  },
  indoorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeIndoorMapButton: {
    backgroundColor: "#912338",
    padding: 12,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CampusMap;
