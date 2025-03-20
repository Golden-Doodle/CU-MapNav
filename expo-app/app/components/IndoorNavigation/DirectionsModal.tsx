// DirectionsModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import SearchablePicker from './SearchablePicker';
import { MappedinDirections, MapViewStore } from '@mappedin/react-native-sdk';
import { generateDirections } from '../../services/Mapped-In/MappedInService';

interface DirectionsModalProps {
  visible: boolean;
  onRequestClose: () => void;
  mapView: React.RefObject<MapViewStore>;
  onDirectionsSet: (directions: MappedinDirections | null) => void;
}

const DirectionsModal: React.FC<DirectionsModalProps> = ({
  visible,
  onRequestClose,
  mapView,
  onDirectionsSet,
}) => {
  const [startRoom, setStartRoom] = useState<string>('');
  const [destinationRoom, setDestinationRoom] = useState<string>('');
  const [roomItems, setRoomItems] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (mapView.current && mapView.current.venueData) {
      const locations = mapView.current.venueData.locations || [];
      const items = locations.map((loc: any) => ({
        label: loc.name,
        value: loc.name,
      }));
      setRoomItems(items);
    }
  }, [mapView.current?.venueData]);

  const getDirections = () => {
    if (!startRoom || !destinationRoom) {
      Alert.alert('Select Room', 'Please select both a start and destination room.');
      return;
    }
    const directions = generateDirections(mapView, startRoom, destinationRoom);
    if (directions) {
      const allLocations = mapView.current?.venueData?.locations || [];
      const departure = allLocations.find((loc: any) => loc.name === startRoom);
      if (departure) {
        if (departure.toMap) {
          mapView.current?.setMap(departure.toMap);
        } else if (departure.nodes && departure.nodes.length > 0) {
          const node = departure.nodes[0];
          if (node.map && node.map.id) {
            mapView.current?.setMap(node.map.id);
          }
        }
      }
      onDirectionsSet(directions);
      onRequestClose();
    } else {
      Alert.alert('Directions Unavailable', 'No directions found between these locations.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
      testID="modal"
    >
      <View style={styles.modalBackground}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onRequestClose}
          testID="backdrop"
        />
        <View style={styles.modalCard}>
          <Text style={styles.headerText}>Select Rooms</Text>

          <Text style={styles.label}>Start Room:</Text>
          <SearchablePicker
            items={roomItems}
            selectedValue={startRoom}
            onValueChange={setStartRoom}
            placeholder="Select a start room"
            modalTitle="Select Start Room"
          />

          <Text style={styles.label}>Destination Room:</Text>
          <SearchablePicker
            items={roomItems}
            selectedValue={destinationRoom}
            onValueChange={setDestinationRoom}
            placeholder="Select a destination room"
            modalTitle="Select Destination Room"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={getDirections}>
              <Text style={styles.buttonText}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onRequestClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DirectionsModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#912338',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  closeButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});