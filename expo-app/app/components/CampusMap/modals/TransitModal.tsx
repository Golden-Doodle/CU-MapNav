import {
  Building,
  concordiaBurgendyColor,
  Coordinates,
  CustomMarkerType,
  LocationType,
  RouteOption,
  TransportMode,
} from "@/app/utils/types";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Card, TextInput as PaperTextInput } from "react-native-paper";
import { fetchAllRoutes } from "@/app/utils/directions";
import useLocationDisplay from "@/app/hooks/useLocationDisplay";
import useSearch from "@/app/hooks/useSearch";
import { useTranslation } from "react-i18next";

interface TransitModalProps {
  visible: boolean;
  onClose: () => void;
  origin: LocationType;
  destination: LocationType;
  setOrigin: React.Dispatch<React.SetStateAction<LocationType>>;
  setDestination: React.Dispatch<React.SetStateAction<LocationType>>;
  setRouteCoordinates: React.Dispatch<React.SetStateAction<Coordinates[]>>;
  buildingData: Building[];
  markerData: CustomMarkerType[];
  userLocation: Coordinates | null;
  testID: string;
}

const TransitModal = ({
  visible,
  onClose,
  origin,
  destination,
  setDestination,
  setOrigin,
  setRouteCoordinates,
  buildingData,
  markerData,
  userLocation,
  testID,
}: TransitModalProps) => {
  const { t } = useTranslation("CampusMap");

  const locationDisplayOrigin = useLocationDisplay(origin);
  const locationDisplayDestination = useLocationDisplay(destination);
  const [routeOptions, setRouteOptions] = React.useState<RouteOption[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = React.useState<boolean>(false);
  const [isSearching, setIsSearching] = React.useState<"origin" | "destination" | null>(null);
  const { filteredData, searchQuery, setSearchQuery } = useSearch({
    data: buildingData,
    searchKey: "name",
  });

  const originInputRef = useRef<TextInput>(null);
  const destinationInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!origin || !destination) return;
    const fetchRoutes = async () => {
      setIsLoadingRoutes(true);
      try {
        const routes = await fetchAllRoutes(origin, destination);
        setRouteOptions(routes);
      } catch (error) {
        console.error(t("Failed to fetch routes"), error);
        setRouteOptions([]);
      } finally {
        setIsLoadingRoutes(false);
      }
    };
    fetchRoutes();
  }, [origin, destination]);

  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case "transit":
        return (
          <FontAwesome5
            name="bus"
            size={24}
            color="#007BFF"
            testID={`${testID}-transport-icon-bus`}
          />
        );
      case "shuttle":
        return (
          <FontAwesome5
            name="shuttle-van"
            size={24}
            color="#28A745"
            testID={`${testID}-transport-icon-shuttle`}
          />
        );
      case "walking":
        return (
          <FontAwesome5
            name="walking"
            size={24}
            color="#6C757D"
            testID={`${testID}-transport-icon-walking`}
          />
        );
      case "driving":
        return (
          <FontAwesome5
            name="car"
            size={24}
            color="#DC3545"
            testID={`${testID}-transport-icon-driving`}
          />
        );
      case "bicycling":
        return (
          <FontAwesome5
            name="bicycle"
            size={24}
            color="#FFC107"
            testID={`${testID}-transport-icon-bicycling`}
          />
        );
      default:
        return null;
    }
  };

  const onSwitchPress = () => {
    resetIsSearching();

    const prevOrigin = origin;
    const prevDestination = destination;

    setOrigin(prevDestination);
    setDestination(prevOrigin);
  };

  const handleOnSelectLocation = (location: Building) => () => {
    if (isSearching === "origin") {
      setOrigin({
        coordinates: location.coordinates[0],
        building: location,
        campus: location.campus,
      });
    } else if (isSearching === "destination") {
      setDestination({
        coordinates: location.coordinates[0],
        building: location,
        campus: location.campus,
        selectedBuilding: true,
      });
    }
    resetIsSearching();
  };

  const handleSetLocationToUserLocation = () => () => {
    if (isSearching === "origin") {
      setOrigin({
        coordinates: userLocation || { latitude: 0, longitude: 0 },
        userLocation: true,
      });
    } else if (isSearching === "destination") {
      setDestination({
        coordinates: userLocation || { latitude: 0, longitude: 0 },
        userLocation: true,
      });
    } else return;
    resetIsSearching();
  };

  const resetIsSearching = () => {
    setIsSearching(null);
    setSearchQuery("");
    originInputRef.current?.blur();
    destinationInputRef.current?.blur();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} testID={`${testID}-modal`}>
      <View style={styles.container} testID={`${testID}-container`}>
        <View style={styles.header} testID={`${testID}-modal-header`}>
          <View style={styles.closeButtonContainer} testID={`${testID}-close-button-container`}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                resetIsSearching();
              }}
              testID={`${testID}-close-button`}
            >
              <FontAwesome5 name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.mapPinContainer} testID={`${testID}-map-pin-container`}>
            <FontAwesome5
              name="dot-circle"
              size={26}
              color="#fff"
              testID={`${testID}-dot-circle`}
            />
            <FontAwesome5
              name="ellipsis-v"
              size={16}
              color="#fff"
              testID={`${testID}-ellipsis-v`}
            />
            <FontAwesome5
              name="map-marker-alt"
              size={24}
              color="#fff"
              testID={`${testID}-map-marker`}
            />
          </View>

          <View style={styles.locationContainer} testID={`${testID}-location-container`}>
            <TextInput
              ref={originInputRef}
              style={styles.titleInput}
              onFocus={() => {
                setIsSearching("origin");
                setSearchQuery(locationDisplayOrigin);
              }}
              onBlur={resetIsSearching}
              value={isSearching === "origin" ? searchQuery : locationDisplayOrigin}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                searchQuery.trim() === "" && resetIsSearching();
              }}
              testID={`${testID}-origin-input`}
            />
            <View style={styles.seperationLine} testID={`${testID}-seperation-line`}></View>
            <TextInput
              ref={destinationInputRef}
              style={styles.titleInput}
              onFocus={() => {
                setIsSearching("destination");
                setSearchQuery(locationDisplayDestination);
              }}
              onBlur={resetIsSearching}
              value={isSearching === "destination" ? searchQuery : locationDisplayDestination}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                searchQuery.trim() === "" && resetIsSearching();
              }}
              testID={`${testID}-destination-input`}
            />
          </View>
          <View style={styles.switchContainer} testID={`${testID}-switch-container`}>
            <TouchableOpacity onPress={onSwitchPress} testID={`${testID}-switch-button`}>
              <FontAwesome5
                name="exchange-alt"
                size={22}
                color="#fff"
                style={{ marginLeft: 0, transform: [{ rotate: "90deg" }] }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {isSearching ? (
          <>
            <TouchableOpacity
              onPress={handleSetLocationToUserLocation()}
              testID={`${testID}-use-current-location`}
            >
              <Card style={styles.card} testID={`${testID}-use-current-location-card`}>
                <Card.Content style={styles.cardContent} testID={`${testID}-card-content`}>
                  <View
                    style={styles.iconContainer}
                    testID={`${testID}-location-arrow-icon-container`}
                  >
                    <FontAwesome5
                      name="location-arrow"
                      size={24}
                      color="#007BFF"
                      testID={`${testID}-location-arrow-icon`}
                    />
                  </View>
                  <View
                    style={styles.textContainer}
                    testID={`${testID}-current-location-text-container`}
                  >
                    <Text style={styles.time} testID={`${testID}-use-current-location-text`}>
                      {t("Use current location")}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={handleOnSelectLocation(item)}
                  testID={`${testID}-search-result-${item.id}`}
                >
                  <Card style={styles.card} testID={`${testID}-card-${item.id}`}>
                    <Card.Content
                      style={styles.cardContent}
                      testID={`${testID}-card-content-${item.id}`}
                    >
                      <View
                        style={styles.iconContainer}
                        testID={`${testID}-icon-container-${item.id}`}
                      >
                        <FontAwesome5
                          name="map-marker-alt"
                          size={24}
                          color="#007BFF"
                          testID={`${testID}-marker-icon-${item.id}`}
                        />
                      </View>
                      <View
                        style={styles.textContainer}
                        testID={`${testID}-text-container-${item.id}`}
                      >
                        <Text style={styles.time} testID={`${testID}-result-name-${item.id}`}>
                          {item.name}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              )}
              testID={`${testID}-search-result-list`}
            />
          </>
        ) : isLoadingRoutes ? (
          <View style={styles.loaderContainer} testID={`${testID}-loader`}>
            <ActivityIndicator size="large" color={concordiaBurgendyColor} />
          </View>
        ) : (
          <FlatList
            data={routeOptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.card} testID={`${testID}-route-card-${item.id}`}>
                <Card.Content style={styles.cardContent} testID={`${testID}-route-card-content-${item.id}`}>
                  <View style={styles.iconContainer} testID={`${testID}-route-icon-container-${item.id}`}>
                    {getTransportIcon(item.mode)}
                  </View>
                  <View style={styles.textContainer} testID={`${testID}-route-text-container-${item.id}`}>
                    <Text style={styles.time} testID={`${testID}-route-time-${item.id}`}>
                      {item?.arrival_time && item?.departure_time
                        ? `${item.departure_time.text} - ${item.arrival_time.text}`
                        : `${new Date().toLocaleTimeString("us-EN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${new Date(
                            Date.now() + item.durationValue * 1000
                          ).toLocaleTimeString("us-EN", { hour: "2-digit", minute: "2-digit" })}`}
                    </Text>
                    {item.distance !== "N/A" && (
                      <Text style={styles.details} testID={`${testID}-route-distance-${item.id}`}>
                        {t("Distance")}: {item.distance}
                      </Text>
                    )}
                    {Boolean(item.duration) && (
                      <Text style={styles.details} testID={`${testID}-route-duration-${item.id}`}>
                        {item.duration} - {t("Mode")}: {item.mode}
                      </Text>
                    )}
                    {item.transport && (
                      <Text style={styles.details} testID={`${testID}-route-transport-${item.id}`}>
                        {t("Transport")}: {item.transport}
                      </Text>
                    )}
                    {item.cost && (
                      <Text style={styles.details} testID={`${testID}-route-cost-${item.id}`}>
                        {t("Cost")}: {item.cost}
                      </Text>
                    )}
                    {item.frequency && (
                      <Text style={styles.details} testID={`${testID}-route-frequency-${item.id}`}>
                        {t("Frequency")}: {item.frequency}
                      </Text>
                    )}
                  </View>
                </Card.Content>
                <TouchableOpacity 
                  style={styles.goButton}
                  onPress={() => {
                    setRouteCoordinates(item.routeCoordinates);
                    onClose();
                  }}
                  testID={`${testID}-go-button-${item.id}`}
                >
                  <Text style={styles.goButtonText}>Go</Text>
                </TouchableOpacity>
              </Card>
            )}
            testID={`${testID}-route-options-list`}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "25%",
    padding: 16,
    backgroundColor: concordiaBurgendyColor,
  },
  closeButtonContainer: {
    position: "absolute",
    left: 13,
    top: 13,
  },
  mapPinContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: "50%",
  },
  locationContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignContent: "center",
    height: "50%",
    width: "80%",
  },
  seperationLine: {
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    width: "100%",
    alignSelf: "center",
    height: 0,
    marginVertical: 10,
  },
  switchContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "50%",
    padding: 0,
  },
  titleInput: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlignVertical: "center",
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    borderWidth: 0,
  },
  card: {
    margin: 4,
    padding: 5,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: "#fff",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  details: {
    fontSize: 14,
    color: "gray",
    marginBottom: 5,
  },
  stepsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  stepText: {
    fontSize: 12,
    color: "gray",
    marginBottom: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  goButton: {
    backgroundColor: "#912338",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: "flex-end",
    margin: 8,
  },
  goButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TransitModal;