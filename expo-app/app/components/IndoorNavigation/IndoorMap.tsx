import React, { useState, useRef, useEffect } from 'react';
import {
 SafeAreaView,
 View,
 ActivityIndicator,
 TouchableOpacity,
 Text,
 FlatList,
 Alert,
 StyleSheet,
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
import { useRouter } from 'expo-router';

import { colors } from './Styling/Constants';
import {
 getWashroomMarkerHtml,
 getFountainMarkerHtml,
 getDefaultMarkerHtml,
 getVerticalMarkerHtml,
 getEntranceExitMarkerHtml,
} from './Styling/markerTemplate';

import DirectionsModal from '@/app/components/IndoorNavigation/DirectionsModal';
import BuildingFloorModal from '@/app/components/IndoorNavigation/SetBuildingFloorModal';
import Constants from 'expo-constants';
import { RoomLocation, LocationType, Coordinates, Building } from '@/app/utils/types';
import { generateDirections as generateIndoorDirections } from '@/app/services/Mapped-In/MappedInService';
import styles from './Styling/IndoorMap.styles';
import IndoorNavigationBridge from '@/app/components/NavigationBridge/IndoorNavigationBridge';
import { getMappedInVenueId } from '@/app/services/NavigationBridge/BuildingEntranceService';

const buildings = [
 { label: 'Hall', value: '67c87db88e15de000bed1abb' },
 { label: 'JMSB', value: '67d974ddf63286000bb80fc3' },
];

const key = Constants.expoConfig?.extra?.mappedInApiKey;
const secret = Constants.expoConfig?.extra?.mappedInSecret;

export interface IndoorMapProps {
 destinationRoom?: RoomLocation;
 userLocation?: Coordinates;
 indoorBuildingId?: string;
 onExitBuilding?: (exitLocation: LocationType) => void;
 onNavigationComplete?: () => void;
}

// A simple error boundary to catch WebView errors and avoid a full app crash
class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
 constructor(props: any) {
 super(props);
 this.state = { hasError: false };
 }
 static getDerivedStateFromError(error: any) {
 return { hasError: true };
 }
 componentDidCatch(error: any, info: any) {
 console.error('ErrorBoundary caught an error:', error, info);
 }
 render() {
 if (this.state.hasError) {
 return (
 <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
 <Text>Something went wrong with the map.</Text>
 </View>
 );
 }
 return this.props.children;
 }
}

const IndoorMap: React.FC<IndoorMapProps> = ({
 destinationRoom,
 userLocation,
 indoorBuildingId,
 onExitBuilding,
 onNavigationComplete,
}) => {
 const router = useRouter();

 // Mounted flag to prevent state updates after unmounting
 const isMounted = useRef(true);
 useEffect(() => {
 return () => {
 isMounted.current = false;
 };
 }, []);

 const mapView = useRef<MapViewStore>(null);
 const [levels, setLevels] = useState<MappedinMap[]>();
 const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
 const [isMapLoading, setIsMapLoading] = useState(true);
 const [selectedBuilding, setSelectedBuilding] = useState<string | null>(
 indoorBuildingId ? getMappedInVenueId(indoorBuildingId) : buildings[0].value
 );
 const [buildingItems] = useState<{ label: string; value: string }[]>(buildings);
 const [floorItems, setFloorItems] = useState<{ label: string; value: string }[]>([]);
 const [directionsModalVisible, setDirectionsModalVisible] = useState(false);
 const [settingsModalVisible, setSettingsModalVisible] = useState(false);
 const [activeDirections, setActiveDirections] = useState<MappedinDirections | null>(null);
 const [showDirections, setShowDirections] = useState(false);
 const [showBridgeModal, setShowBridgeModal] = useState(false);
 const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
 const [isNavigationMode, setIsNavigationMode] = useState(!!destinationRoom);
 const [entranceExitNodes, setEntranceExitNodes] = useState<string[]>([]);

 const verticalMarkerIds = useRef<string[]>([]);

 // Set current building details based on indoorBuildingId
 useEffect(() => {
 if (indoorBuildingId) {
 let mappedId = indoorBuildingId;
 let building: Building | null = null;

 if (indoorBuildingId === 'MB' || indoorBuildingId === 'JMSB') {
 mappedId = '67d974ddf63286000bb80fc3';
 building = {
 id: 'MB',
 name: 'John Molson Building',
 coordinates: [{ latitude: 45.49535, longitude: -73.57941 }],
 fillColor: '#0000FF',
 strokeColor: '#000000',
 campus: 'SGW',
 };
 } else if (indoorBuildingId === 'H') {
 mappedId = '67c87db88e15de000bed1abb';
 building = {
 id: 'H',
 name: 'Hall Building',
 coordinates: [{ latitude: 45.49720, longitude: -73.57901 }],
 fillColor: '#0000FF',
 strokeColor: '#000000',
 campus: 'SGW',
 };
 }

 setSelectedBuilding(mappedId);
 setCurrentBuilding(building);

 if (destinationRoom) {
 setIsNavigationMode(true);
 }
 }
 }, [indoorBuildingId, destinationRoom]);

 const options = {
 key,
 secret,
 mapId: selectedBuilding ?? '',
 labelAllLocationsOnInit: false,
 };

 // Bridge navigation between indoor and outdoor
 useEffect(() => {
 if (isNavigationMode && currentBuilding && destinationRoom) {
 setShowBridgeModal(true);
 }
 }, [isNavigationMode, currentBuilding, destinationRoom]);

 useEffect(() => {
 async function setMapAndMarkers() {
 if (selectedFloor && selectedFloor !== mapView.current?.currentMap?.id) {
 await mapView.current?.setMap(selectedFloor);
 }
 setTimeout(() => {
 renderVerticalConnections();
 renderEntranceExitPoints();
 }, 100);
 }
 setMapAndMarkers();
 }, [selectedFloor]);

 useEffect(() => {
 if (mapView.current?.currentMap) {
 renderVerticalConnections();
 renderEntranceExitPoints();
 }
 }, [mapView.current?.currentMap]);

 const renderEntranceExitPoints = () => {
 entranceExitNodes.forEach((id) => {
 mapView.current?.removeMarker(id);
 });
 setEntranceExitNodes([]);

 const mappedinData = mapView.current?.venueData;
 const currentMap = mapView.current?.currentMap;

 if (mappedinData && currentMap) {
 const entranceKeywords = ['entrance', 'exit', 'door', 'lobby'];
 const entranceLocations = mappedinData.locations.filter((loc: any) =>
 entranceKeywords.some((keyword) => loc.name.toLowerCase().includes(keyword))
 );

 entranceLocations.forEach((location: any) => {
 if (location.polygons?.length > 0) {
 const polygon = location.polygons[0];
 if (polygon.entrances?.length > 0 && polygon.entrances[0].map.id === currentMap.id) {
 const node = polygon.entrances[0];
 const markerHtml = getEntranceExitMarkerHtml(location.name);
 const markerId = mapView.current?.createMarker(node, markerHtml, {
 anchor: MARKER_ANCHOR.CENTER,
 rank: COLLISION_RANKING_TIERS.ALWAYS_VISIBLE,
 });

 if (markerId) {
 setEntranceExitNodes((prev) => [...prev, markerId]);
 }
 }
 }
 });
 }
 };

 const renderVerticalConnections = () => {
 verticalMarkerIds.current.forEach((id) => {
 mapView.current?.removeMarker(id);
 });
 verticalMarkerIds.current = [];
 const mappedinData = mapView.current?.venueData;
 const currentMap = mapView.current?.currentMap;
 if (mappedinData && currentMap) {
 const verticalTypes = ['escalator', 'elevator', 'stairs'];
 const connections = mappedinData.vortexes.filter(
 (v: any) => v.type && verticalTypes.includes(v.type.toLowerCase())
 );
 connections.forEach((vortex: any) => {
 (vortex.nodes || []).forEach((nodeId: string) => {
 const node = mappedinData.nodes.find((n: any) => n.id === nodeId);
 if (node && node.map.id === currentMap.id) {
 const typeKey = vortex.type.toLowerCase();
 const fillColor = colors[typeKey as keyof typeof colors] || 'gray';
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
 }
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

 const name = location.name ?? '';
 let markerHtml = '';

 if (name.toLowerCase().includes('washroom') || name.toLowerCase().includes('restroom')) {
 markerHtml = getWashroomMarkerHtml(location.name);
 } else if (name.toLowerCase().includes('fountain') || name.toLowerCase().includes('water')) {
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
 if (!isMounted.current) return;
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
 const directions = generateIndoorDirections(mapView, 'Entrance #1', destinationRoom.room);
 if (directions) {
 setActiveDirections(directions);
 if (directions.path && directions.path.length > 0 && directions.path[0].map) {
 const startingMapId = directions.path[0].map.id;
 await mapView.current?.setMap(startingMapId);
 setSelectedFloor(startingMapId);
 }
 } else {
 Alert.alert('No Directions Found', `No indoor directions found for room ${destinationRoom.room}`);
 }
 }

 renderPOIMarkers();
 renderVerticalConnections();
 renderEntranceExitPoints();
 };

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

 // Direct navigation to campus map
 const handleGoToCampusMap = () => {
 // Navigate directly to the CampusMapScreen
 router.push("/screens/Home/CampusMapScreen");
 };

 const handleContinueIndoors = () => {
 setShowBridgeModal(false);

 if (destinationRoom) {
 const directions = generateIndoorDirections(mapView, 'Entrance #1', destinationRoom.room);
 if (directions) {
 setActiveDirections(directions);
 setShowDirections(true);
 }
 }
 };

 return (
 <SafeAreaView style={styles.container} testID="indoorMapContainer">
 <View style={styles.contentContainer} testID="indoorMapContent">
 <View style={styles.mapContainer} testID="mapContainer">
 <ErrorBoundary>
 <MiMapView
 style={styles.map}
 key={selectedBuilding ?? 'default'}
 ref={mapView}
 options={options}
 onFirstMapLoaded={handleFirstMapLoaded}
 onMapChanged={({ map }) => {
 if (mapView.current) {
 setSelectedFloor(map.id);
 }
 }}
 />
 </ErrorBoundary>
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

 {/* Campus Map Button */}
 <TouchableOpacity
 style={additionalStyles.campusMapButton}
 onPress={handleGoToCampusMap}
 testID="campusMapButton"
 >
 <Icon name="map" size={24} color="#912338" />
 <Text style={additionalStyles.buttonText}>Campus Map</Text>
 </TouchableOpacity>

 {activeDirections?.instructions?.length ? (
 <View style={styles.directionsOverlay} testID="directionsOverlay" pointerEvents="box-none">
 {showDirections ? (
 <View style={styles.directionsContainer} testID="directionsContainer">
 <View style={styles.directionsHeaderRow} testID="directionsHeaderRow">
 <Text style={styles.directionsTitle} testID="directionsTitle">
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
 <View style={styles.directionsButtonColumn} testID="directionsButtonColumn">
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
 Alert.alert('Directions Unavailable', 'No valid paths found.');
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

 {currentBuilding && (
 <IndoorNavigationBridge
 visible={showBridgeModal}
 onClose={() => setShowBridgeModal(false)}
 building={currentBuilding}
 destinationRoom={destinationRoom}
 userLocation={userLocation || null}
 onExitBuilding={handleGoToCampusMap}
 onContinueIndoors={handleContinueIndoors}
 />
 )}
 </SafeAreaView>
 );
};

// Additional styles for the campus map button
const additionalStyles = StyleSheet.create({
 campusMapButton: {
 position: 'absolute',
 bottom: 20,
 left: 20,
 backgroundColor: 'white',
 borderRadius: 12,
 paddingVertical: 10,
 paddingHorizontal: 15,
 flexDirection: 'row',
 alignItems: 'center',
 elevation: 5,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.25,
 shadowRadius: 3.84,
 },
 buttonText: {
 marginLeft: 8,
 fontSize: 16,
 fontWeight: 'bold',
 color: '#912338',
 }
});

export default IndoorMap;