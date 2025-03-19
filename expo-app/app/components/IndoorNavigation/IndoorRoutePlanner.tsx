import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  MappedinDirections,
  TMappedinDirective,
  MapViewStore,
} from '@mappedin/react-native-sdk';
import {
  fetchRoomItems,
  generateDirections,
  clearDirections,
  RoomItem,
} from '../../services/Mapped-In/MappedInService';

interface IndoorRoutePlannerProps {
  mapView: React.RefObject<MapViewStore>;
  onRequestClose: () => void;
}

const DirectionsFlatList = ({
  directions,
}: {
  directions: MappedinDirections | null;
}) => {
  if (!directions) return null;

  const renderItem = ({ item }: { item: TMappedinDirective }) => (
    <Text style={styles.directionText}>{item.instruction}</Text>
  );

  return (
    <FlatList
      data={directions.instructions}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
    />
  );
};

const IndoorRoutePlanner: React.FC<IndoorRoutePlannerProps> = ({
  mapView,
  onRequestClose,
}) => {
  const [startRoom, setStartRoom] = useState<string>('');
  const [destinationRoom, setDestinationRoom] = useState<string>('');
  const [roomItems, setRoomItems] = useState<RoomItem[]>([]);
  const [activeDirections, setActiveDirections] =
    useState<MappedinDirections | null>(null);

  useEffect(() => {
    const items = fetchRoomItems(mapView);
    setRoomItems(items);
    if (items.length > 0) {
      setStartRoom(items[0].value);
      setDestinationRoom(items[0].value);
    }
  }, [mapView.current?.venueData]);

  const handleGetDirections = () => {
    const directions = generateDirections(mapView, startRoom, destinationRoom);
    if (directions) {
      setActiveDirections(directions);
    } else {
      Alert.alert(
        'Directions Unavailable',
        'No directions found between these locations or location not found.'
      );
    }
  };

  const handleCancelDirections = () => {
    clearDirections(mapView);
    setActiveDirections(null);
  };

  const toggleDirections = () => {
    if (activeDirections) {
      handleCancelDirections();
    } else {
      handleGetDirections();
    }
  };

  return (
    <View style={styles.modalContent}>
      <Text style={styles.headerText}>Get Directions</Text>

      <Text style={styles.label}>Select Starting Position:</Text>
      <Picker
        selectedValue={startRoom}
        onValueChange={(itemValue) => setStartRoom(itemValue)}
        style={styles.picker}
      >
        {roomItems.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>

      <Text style={styles.label}>Select Destination:</Text>
      <Picker
        selectedValue={destinationRoom}
        onValueChange={(itemValue) => setDestinationRoom(itemValue)}
        style={styles.picker}
      >
        {roomItems.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, activeDirections ? styles.cancelButton : null]}
          onPress={toggleDirections}
        >
          <Text style={styles.buttonText}>
            {activeDirections ? 'Cancel Directions' : 'Get Directions'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.closeButton]}
          onPress={onRequestClose}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>

      {activeDirections && (
        <View style={styles.directionsContainer}>
          <DirectionsFlatList directions={activeDirections} />
        </View>
      )}
    </View>
  );
};

export default IndoorRoutePlanner;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    color: '#000',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#912338',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  closeButton: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  directionsContainer: {
    marginTop: 10,
    maxHeight: 150,
  },
  directionText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
});