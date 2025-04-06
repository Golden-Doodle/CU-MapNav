import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  MiMapView,
  MappedinMap,
  MappedinDirections,
  MapViewStore,
  MARKER_ANCHOR,
  COLLISION_RANKING_TIERS,
} from "@mappedin/react-native-sdk";

import { colors } from "./Styling/Constants";
import {
  getWashroomMarkerHtml,
  getFountainMarkerHtml,
  getDefaultMarkerHtml,
  getVerticalMarkerHtml,
} from "./Styling/markerTemplate";

import DirectionsModal from "@/app/components/IndoorNavigation/DirectionsModal";
import BuildingFloorModal from "@/app/components/IndoorNavigation/SetBuildingFloorModal";
import Constants from "expo-constants";
import { RoomLocation } from "@/app/utils/types";
import { generateDirections as generateIndoorDirections } from "@/app/services/Mapped-In/MappedInService";
import styles from "./Styling/IndoorMap.styles";

const buildings = [
  { label: "Hall", value: "67c87db88e15de000bed1abb" },
  { label: "JMSB", value: "67d974ddf63286000bb80fc3" },
];

const key = Constants.expoConfig?.extra?.mappedInApiKey;
const secret = Constants.expoConfig?.extra?.mappedInSecret;

export interface IndoorMapProps {
  destinationRoom?: RoomLocation;
  pressedOptimizeRoute?: boolean;
  indoorBuildingId?: string;
}

const IndoorMap = ({
  destinationRoom,
  pressedOptimizeRoute,
  indoorBuildingId,
}: IndoorMapProps) => {
  const mapView = useRef<MapViewStore>(null);
  const [levels, setLevels] = useState<MappedinMap[]>();
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(
    indoorBuildingId ?? buildings[0].value
  );
  const [buildingItems] =
    useState<{ label: string; value: string }[]>(buildings);
  const [floorItems, setFloorItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [directionsModalVisible, setDirectionsModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [activeDirections, setActiveDirections] =
    useState<MappedinDirections | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  const verticalMarkerIds = useRef<string[]>([]);

  useEffect(() => {
    if (indoorBuildingId) {
      let mappedId = indoorBuildingId;
      if (indoorBuildingId === "MB") {
        mappedId = "67d974ddf63286000bb80fc3";
      } else if (indoorBuildingId === "H") {
        mappedId = "67c87db88e15de000bed1abb";
      }
      setSelectedBuilding(mappedId);
    }
  }, [indoorBuildingId]);

  const options = {
    key,
    secret,
    mapId: selectedBuilding ?? "",
    labelAllLocationsOnInit: false,
  };

  useEffect(() => {
    async function setMapAndMarkers() {
      if (selectedFloor && selectedFloor !== mapView.current?.currentMap?.id) {
        await mapView.current?.setMap(selectedFloor);
      }
      setTimeout(() => {
        renderVerticalConnections();
      }, 100);
    }
    setMapAndMarkers();
  }, [selectedFloor]);

  useEffect(() => {
    if (mapView.current?.currentMap) {
      renderVerticalConnections();
    }
  }, [mapView.current?.currentMap]);

  const renderVerticalConnections = () => {
    verticalMarkerIds.current.forEach((id) => {
      mapView.current?.removeMarker(id);
    });
    verticalMarkerIds.current = [];
    const mappedinData = mapView.current?.venueData;
    const currentMap = mapView.current?.currentMap;
    if (!mappedinData || !currentMap) return;
    const verticalTypes = ["escalator", "elevator", "stairs"];
    const connections = mappedinData.vortexes.filter(
      (v) => v.type && verticalTypes.includes(v.type.toLowerCase())
    );
    connections.forEach((vortex: any) => {
      (vortex.nodes ?? []).forEach((nodeId: string) => {
        const node = mappedinData.nodes.find((n: any) => n.id === nodeId);
        if (node && node.map.id === currentMap.id) {
          const typeKey = vortex.type.toLowerCase();
          const fillColor = colors[typeKey as keyof typeof colors] || "gray";
          const connectionLabel =
            vortex.name && vortex.name.trim().length > 0
              ? vortex.name
              : vortex.type.charAt(0).toUpperCase() + vortex.type.slice(1);
          const markerHtml = getVerticalMarkerHtml(connectionLabel, fillColor);
          const markerId = mapView.current?.createMarker(node, markerHtml, {
            anchor: MARKER_ANCHOR.CENTER,
            rank: COLLISION_RANKING_TIERS.ALWAYS_VISIBLE,
          });
          if (markerId) {
            verticalMarkerIds.current.push(markerId);
          }
        }
      });
    });
  };

  const renderPOIMarkers = () => {
    const allLocations = mapView.current?.venueData?.locations || [];
    allLocations.forEach((location: any) => {
      let markerPosition = null;
      if (location.polygons?.length > 0) {
        const firstPolygon = location.polygons[0];
        if (firstPolygon.entrances?.length > 0) {
          markerPosition = firstPolygon.entrances[0];
        } else if (firstPolygon.nodes?.length > 0) {
          markerPosition = firstPolygon.nodes[0];
        }
      } else if (location.nodes?.length > 0) {
        markerPosition = location.nodes[0];
      }
      if (!markerPosition) return;

      const name = location.name ?? "";
      let markerHtml = "";

      if (
        name.toLowerCase().includes("washroom") ||
        name.toLowerCase().includes("restroom")
      ) {
        markerHtml = getWashroomMarkerHtml(location.name);
      } else if (
        name.toLowerCase().includes("fountain") ||
        name.toLowerCase().includes("water")
      ) {
        markerHtml = getFountainMarkerHtml(location.name);
      } else {
        markerHtml = getDefaultMarkerHtml(location.name);
      }
      mapView.current?.createMarker(markerPosition, markerHtml, {
        anchor: MARKER_ANCHOR.CENTER,
        rank: COLLISION_RANKING_TIERS.ALWAYS_VISIBLE,
      });
    });
  };

  const handleFirstMapLoaded = async () => {
    setIsMapLoading(false);
    const currentMapId = mapView.current?.currentMap?.id;
    const availableMaps = mapView.current?.venueData?.maps || [];
    setSelectedFloor(currentMapId ?? null);

    const items = availableMaps.map((floor) => ({
      label: floor.name,
      value: floor.id,
    }));
    setFloorItems(items);
    setLevels(availableMaps);

    if (destinationRoom) {
      const directions = generateIndoorDirections(
        mapView,
        "Entrance #1",
        destinationRoom.room
      );
      if (directions) {
        setActiveDirections(directions);
        if (
          directions.path &&
          directions.path.length > 0 &&
          directions.path[0].map
        ) {
          const startingMapId = directions.path[0].map.id;
          await mapView.current?.setMap(startingMapId);
          setSelectedFloor(startingMapId);
        }
      } else {
        Alert.alert(
          "No Directions Found",
          `No indoor directions found for room ${destinationRoom.room}`
        );
      }
    }

    renderPOIMarkers();
    renderVerticalConnections();
  };

  const handleBuildingChange: React.Dispatch<
    React.SetStateAction<string | null>
  > = (value) => {
    if (typeof value === "function") {
      setSelectedBuilding(value(selectedBuilding));
    } else {
      setSelectedBuilding(value);
      setLevels(undefined);
      setSelectedFloor(null);
      setIsMapLoading(true);
      setFloorItems([]);
      setActiveDirections(null);
    }
  };

  const cancelDirections = () => {
    if (mapView.current?.Journey.clear) {
      mapView.current.Journey.clear();
    }
    setActiveDirections(null);
  };

  return (
    <SafeAreaView style={styles.container} testID="indoorMapContainer">
      <View style={styles.contentContainer} testID="indoorMapContent">
        <View style={styles.mapContainer} testID="mapContainer">
          <MiMapView
            style={styles.map}
            key={selectedBuilding ?? "default"}
            ref={mapView}
            options={options}
            onFirstMapLoaded={handleFirstMapLoaded}
            onMapChanged={({ map }) => {
              setSelectedFloor(map.id);
            }}
          />
          {isMapLoading && (
            <View style={styles.loaderContainer} testID="loaderContainer">
              <ActivityIndicator size="large" color="#912338" />
            </View>
          )}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setSettingsModalVisible(true)}
            testID="settingsButton"
          >
            <Icon name="settings" size={32} color="#912338" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => setDirectionsModalVisible(true)}
            testID="directionsButton"
          >
            <Icon name="directions-walk" size={35} color="#912338" />
          </TouchableOpacity>
          {activeDirections?.instructions?.length ? (
            <View
              style={styles.directionsOverlay}
              testID="directionsOverlay"
              pointerEvents="box-none"
            >
              {showDirections ? (
                <View
                  style={styles.directionsContainer}
                  testID="directionsContainer"
                >
                  <View
                    style={styles.directionsHeaderRow}
                    testID="directionsHeaderRow"
                  >
                    <Text
                      style={styles.directionsTitle}
                      testID="directionsTitle"
                    >
                      Directions
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDirections(false)}
                      style={styles.iconButton}
                      testID="minimizeButton"
                    >
                      <Icon name="minimize" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={activeDirections.instructions}
                    renderItem={({ item }) => (
                      <Text style={styles.instruction}>{item.instruction}</Text>
                    )}
                    keyExtractor={(_, index) => index.toString()}
                    style={styles.directionsList}
                    testID="directionsList"
                  />
                </View>
              ) : (
                <View
                  style={styles.directionsButtonColumn}
                  testID="directionsButtonColumn"
                >
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={cancelDirections}
                    testID="cancelDirectionsButton"
                  >
                    <Text style={styles.buttonText}>Cancel Directions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.showButton]}
                    onPress={() => setShowDirections(true)}
                    testID="showDirectionsButton"
                  >
                    <Text style={styles.buttonText}>Show Directions</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}
        </View>
      </View>

      <DirectionsModal
        visible={directionsModalVisible}
        onRequestClose={() => setDirectionsModalVisible(false)}
        mapView={mapView}
        onDirectionsSet={(directions) => {
          if (
            !directions ||
            !directions.instructions ||
            directions.instructions.length === 0 ||
            (directions.distance === 0 &&
              directions.instructions.length === 1 &&
              directions.path.length === 0)
          ) {
            Alert.alert("Directions Unavailable", "No valid paths found.");
            return;
          }
          setActiveDirections(directions);
          setDirectionsModalVisible(false);
        }}
      />

      <BuildingFloorModal
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
        selectedBuilding={selectedBuilding}
        onChangeBuilding={handleBuildingChange}
        buildingItems={buildingItems}
        selectedFloor={selectedFloor}
        onChangeFloor={setSelectedFloor}
        floorItems={floorItems}
      />
    </SafeAreaView>
  );
};

export default IndoorMap;
