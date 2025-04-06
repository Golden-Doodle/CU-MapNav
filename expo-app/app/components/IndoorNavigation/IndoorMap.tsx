import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  MiMapView,
  MappedinMap,
  MappedinDirections,
  MapViewStore,
  MARKER_ANCHOR,
  COLLISION_RANKING_TIERS,
} from '@mappedin/react-native-sdk';

import { colors } from './Styling/Constants';
import {
  getWashroomMarkerHtml,
  getFountainMarkerHtml,
  getDefaultMarkerHtml,
  getVerticalMarkerHtml,
} from './Styling/markerTemplate';

import DirectionsModal from '@/app/components/IndoorNavigation/DirectionsModal';
import BuildingFloorModal from '@/app/components/IndoorNavigation/SetBuildingFloorModal';
import Constants from 'expo-constants';
import { RoomLocation } from '@/app/utils/types';
import { generateDirections } from '@/app/services/Mapped-In/MappedInService';
import styles from './Styling/IndoorMap.styles';

const buildings = [
  { label: 'Hall', value: '67c87db88e15de000bed1abb' },
  { label: 'JMSB', value: '67d974ddf63286000bb80fc3' },
];

const key = Constants.expoConfig?.extra?.mappedInApiKey;
const secret = Constants.expoConfig?.extra?.mappedInSecret;

export interface IndoorMapProps {
  destinationRoom?: RoomLocation;
  pressedOptimizeRoute?: boolean;
  indoorBuildingId?: string;
}

interface ExtendedMappedinDirections extends MappedinDirections {
  startRoom: string;
  destinationRoom: string;
}

const IndoorMap = ({ destinationRoom, pressedOptimizeRoute, indoorBuildingId }: IndoorMapProps) => {
  const mapView = useRef<MapViewStore>(null);
  const [levels, setLevels] = useState<MappedinMap[]>();
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(indoorBuildingId ?? buildings[0].value);
  const [buildingItems] = useState(buildings);
  const [floorItems, setFloorItems] = useState<{ label: string; value: string }[]>([]);
  const [directionsModalVisible, setDirectionsModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [activeDirections, setActiveDirections] = useState<MappedinDirections | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [activeEndpoints, setActiveEndpoints] = useState<{ start: string; destination: string } | null>(null);
  const [isAccessibilityOn, setIsAccessibilityOn] = useState(false);
  const verticalMarkerIds = useRef<string[]>([]);

  useEffect(() => {
    if (indoorBuildingId) {
      let mappedId = indoorBuildingId;
      if (indoorBuildingId === 'MB') mappedId = '67d974ddf63286000bb80fc3';
      else if (indoorBuildingId === 'H') mappedId = '67c87db88e15de000bed1abb';
      setSelectedBuilding(mappedId);
    }
  }, [indoorBuildingId]);

  const options = { key, secret, mapId: selectedBuilding ?? '', labelAllLocationsOnInit: false };

  useEffect(() => {
    async function setMapAndMarkers() {
      if (selectedFloor && selectedFloor !== mapView.current?.currentMap?.id) {
        await mapView.current?.setMap(selectedFloor);
      }
      setTimeout(renderVerticalConnections, 100);
    }
    setMapAndMarkers();
  }, [selectedFloor]);

  useEffect(() => {
    if (mapView.current?.currentMap) renderVerticalConnections();
  }, [mapView.current?.currentMap]);

  const renderVerticalConnections = () => {
    verticalMarkerIds.current.forEach(id => mapView.current?.removeMarker(id));
    verticalMarkerIds.current = [];

    const mappedinData = mapView.current?.venueData;
    const currentMap = mapView.current?.currentMap;
    if (!mappedinData || !currentMap) return;

    const verticalTypes = ['escalator', 'elevator', 'stairs'];
    const connections = mappedinData.vortexes.filter(v => v.type && verticalTypes.includes(v.type.toLowerCase()));

    connections.forEach((vortex: any) => {
      (vortex.nodes || []).forEach((nodeId: string) => {
        const node = mappedinData.nodes.find((n: any) => n.id === nodeId);
        if (node && node.map.id === currentMap.id) {
          const typeKey = vortex.type.toLowerCase();
          const fillColor = colors[typeKey as keyof typeof colors] || 'gray';
          const label = vortex.name?.trim().length ? vortex.name : vortex.type.charAt(0).toUpperCase() + vortex.type.slice(1);
          const markerHtml = getVerticalMarkerHtml(label, fillColor);
          const markerId = mapView.current?.createMarker(node, markerHtml, {
            anchor: MARKER_ANCHOR.CENTER,
            rank: COLLISION_RANKING_TIERS.ALWAYS_VISIBLE,
          });
          if (markerId) verticalMarkerIds.current.push(markerId);
        }
      });
    });
  };

  const renderPOIMarkers = () => {
    const allLocations = mapView.current?.venueData?.locations || [];
    allLocations.forEach((location: any) => {
      let markerPosition = location.polygons?.[0]?.entrances?.[0] || location.polygons?.[0]?.nodes?.[0] || location.nodes?.[0];
      if (!markerPosition) return;

      const name = location.name ?? '';
      let markerHtml = name.toLowerCase().includes('washroom')
        ? getWashroomMarkerHtml(name)
        : name.toLowerCase().includes('fountain')
        ? getFountainMarkerHtml(name)
        : getDefaultMarkerHtml(name);

      mapView.current?.createMarker(markerPosition, markerHtml, {
        anchor: MARKER_ANCHOR.CENTER,
        rank: COLLISION_RANKING_TIERS.ALWAYS_VISIBLE,
      });
    });
  };

  const handleFirstMapLoaded = async () => {
    setIsMapLoading(false);
    const currentMapId = mapView.current?.currentMap?.id;
    setSelectedFloor(currentMapId ?? null);

    const availableMaps = mapView.current?.venueData?.maps || [];
    const items = availableMaps.map(f => ({ label: f.name, value: f.id }));
    setFloorItems(items);
    setLevels(availableMaps);

    if (destinationRoom) {
      const startRoom = 'Entrance #1';
      const directions = generateDirections(mapView, startRoom, destinationRoom.room);
      if (directions) {
        setActiveDirections(directions);
        setActiveEndpoints({ start: startRoom, destination: destinationRoom.room });
        if (directions.path?.[0]?.map?.id) {
          await mapView.current?.setMap(directions.path[0].map.id);
          setSelectedFloor(directions.path[0].map.id);
        }
      } else {
        Alert.alert('No Directions Found', `No indoor directions found for room ${destinationRoom.room}`);
      }
    }

    renderPOIMarkers();
    renderVerticalConnections();
  };

  const cancelDirections = () => {
    mapView.current?.Journey?.clear?.();
    setActiveDirections(null);
    setActiveEndpoints(null);
    setIsAccessibilityOn(false);
    setShowDirections(false);
  };

  const handleAccessibleDirections = () => {
    if (!activeEndpoints) {
      Alert.alert('Directions Unavailable', 'No valid start and destination available.');
      return;
    }
  
    const { start, destination } = activeEndpoints;
  
    if (isAccessibilityOn) {
      
      const standardDirections = generateDirections(mapView, start, destination);
      if (!standardDirections || !standardDirections.instructions?.length) {
        Alert.alert('No directions found');
        return;
      }
  
      mapView.current?.Journey.draw(standardDirections);
      setActiveDirections(standardDirections);
      const extDir = standardDirections as ExtendedMappedinDirections;
      setActiveEndpoints({ start: extDir.startRoom, destination: extDir.destinationRoom });
      setIsAccessibilityOn(false);
      setShowDirections(true);
      return;
    }
  
    const accessibleDirections = generateDirections(mapView, start, destination, {
      accessible: true,
    });
  
    if (!accessibleDirections || !accessibleDirections.instructions?.length) {
      Alert.alert('No accessible route found');
      return;
    }
  
    mapView.current?.Journey.draw(accessibleDirections);
    setActiveDirections(accessibleDirections);
    const extDir = accessibleDirections as ExtendedMappedinDirections;
    setActiveEndpoints({ start: extDir.startRoom, destination: extDir.destinationRoom });
    setIsAccessibilityOn(true);
    setShowDirections(true);
  };
  

  return (
    <SafeAreaView style={styles.container} testID="indoorMapContainer">
      <View style={styles.contentContainer} testID="indoorMapContent">
        <View style={styles.mapContainer} testID="mapContainer">
          <MiMapView
            style={styles.map}
            key={selectedBuilding ?? 'default'}
            ref={mapView}
            options={options}
            onFirstMapLoaded={handleFirstMapLoaded}
            onMapChanged={({ map }) => setSelectedFloor(map.id)}
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
            style={styles.accessibilityButton}
            onPress={handleAccessibleDirections}
            disabled={!activeEndpoints}
            testID="accessibilityButton"
          >
            <Icon name="accessible" size={35} color={!activeEndpoints ? '#999' : isAccessibilityOn ? '#912338' : '#666'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => setDirectionsModalVisible(true)}
            testID="directionsButton"
          >
            <Icon name="directions-walk" size={35} color="#912338" />
          </TouchableOpacity>

          {activeDirections?.instructions?.length ? (
            <View style={styles.directionsOverlay} pointerEvents="box-none" testID="directionsOverlay">
              {showDirections ? (
                <View style={styles.directionsContainer} testID="directionsContainer">
                  <View style={styles.directionsHeaderRow}>
                    <Text style={styles.directionsTitle} testID="directionsTitle">Directions</Text>
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
                  />
                </View>
              ) : (
                <View style={styles.directionsButtonColumn}>
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
        onDirectionsSet={(directions: MappedinDirections | null) => {
          if (!directions || !directions.instructions?.length) {
            Alert.alert('Directions Unavailable', 'No valid paths found.');
            return;
          }
          const extended = directions as ExtendedMappedinDirections;
          setActiveDirections(directions);
          setActiveEndpoints({ start: extended.startRoom, destination: extended.destinationRoom });
          setIsAccessibilityOn(false);
          setDirectionsModalVisible(false);
        }}
      />

      <BuildingFloorModal
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
        selectedBuilding={selectedBuilding}
        onChangeBuilding={setSelectedBuilding}
        buildingItems={buildingItems}
        selectedFloor={selectedFloor}
        onChangeFloor={setSelectedFloor}
        floorItems={floorItems}
      />
    </SafeAreaView>
  );
};

export default IndoorMap;