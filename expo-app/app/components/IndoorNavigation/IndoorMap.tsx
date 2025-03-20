import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  StyleSheet,
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
  TMappedinDirective,
  MapViewStore,
} from '@mappedin/react-native-sdk';

import DirectionsModal from '@/app/components/IndoorNavigation/DirectionsModal';
import BuildingFloorModal from '@/app/components/IndoorNavigation/SetBuildingFloorModal';

const buildings = [
  { label: 'Hall', value: '67c87db88e15de000bed1abb' },
  { label: 'JMSB', value: '67d974ddf63286000bb80fc3' },
];

const key = 'mik_LUeYSdqlvDJYpSHXT56b207a8';
const secret = 'mis_toNhLLj9mmlK5rJzJHebi3km4rjI9V3x3VUzgpPCYbq9a2410c7';

const DirectionsList = ({ directions }: { directions: MappedinDirections | null }) => {
  if (!directions) return null;

  const renderItem = ({ item }: { item: TMappedinDirective }) => (
    <Text style={styles.instruction}>{item.instruction}</Text>
  );

  return (
    <FlatList
      data={directions.instructions}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
      style={styles.directionsList}
    />
  );
};

const IndoorMap = () => {
  const mapView = useRef<MapViewStore>(null);

  const [levels, setLevels] = useState<MappedinMap[]>();
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(buildings[0].value);
  const [buildingItems] = useState<{ label: string; value: string }[]>(buildings);
  const [floorItems, setFloorItems] = useState<{ label: string; value: string }[]>([]);

  const [directionsModalVisible, setDirectionsModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const [activeDirections, setActiveDirections] = useState<MappedinDirections | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  const options = {
    key,
    secret,
    mapId: selectedBuilding ?? '',
  };

  const handleFirstMapLoaded = () => {
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
  };

  useEffect(() => {
    async function setMap() {
      if (selectedFloor && selectedFloor !== mapView.current?.currentMap?.id) {
        await mapView.current?.setMap(selectedFloor);
      }
    }
    setMap();
  }, [selectedFloor]);

  const handleBuildingChange: React.Dispatch<React.SetStateAction<string | null>> = (value) => {
    if (typeof value === 'function') {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.mapContainer}>
          <MiMapView
            style={styles.map}
            key={selectedBuilding ?? 'default'}
            ref={mapView}
            options={options}
            onFirstMapLoaded={handleFirstMapLoaded}
            onMapChanged={({ map }) => setSelectedFloor(map.id)}
          />

          {isMapLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#912338" />
            </View>
          )}

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Icon name="settings" size={32} color="#912338" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => setDirectionsModalVisible(true)}
          >
            <Icon name="directions-walk" size={35} color="#912338" />
          </TouchableOpacity>

          {activeDirections?.instructions?.length ? (
            <View style={styles.directionsOverlay} pointerEvents="box-none">
              {showDirections ? (
                <View style={styles.directionsContainer}>
                  <View style={styles.directionsHeaderRow}>
                    <Text style={styles.directionsTitle}>Directions</Text>
                    <TouchableOpacity
                      onPress={() => setShowDirections(false)}
                      style={styles.iconButton}
                    >
                      <Icon name="minimize" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <DirectionsList directions={activeDirections} />
                </View>
              ) : (
                <View style={styles.directionsButtonColumn}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={cancelDirections}
                  >
                    <Text style={styles.buttonText}>Cancel Directions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.showButton]}
                    onPress={() => setShowDirections(true)}
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
            Alert.alert('Directions Unavailable', 'No valid paths found.');
            return;
          }
          setActiveDirections(directions);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  contentContainer: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    zIndex: 20,
  },
  directionsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 8,
    zIndex: 20,
  },
  directionsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 15,
  },
  directionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 10,
    width: 280,
    maxHeight: 300,
    elevation: 3,
  },
  directionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  directionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  directionsList: {
    marginVertical: 5,
  },
  instruction: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
  directionsButtonColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
  },
  iconButton: {
    padding: 5,
  },
  button: {
    backgroundColor: '#912338',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  showButton: {
    backgroundColor: '#912338',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});