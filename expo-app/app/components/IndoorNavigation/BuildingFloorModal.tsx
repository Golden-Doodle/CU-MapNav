import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BuildingDropdown, FloorDropdown } from '@/app/components/IndoorNavigation/DropDownPicker';

interface IBuildingFloorSettingsModalProps {
  visible: boolean;
  onRequestClose: () => void;

  selectedBuilding: string | null;
  onChangeBuilding: React.Dispatch<React.SetStateAction<string | null>>;
  buildingItems: { label: string; value: string }[];

  selectedFloor: string | null;
  onChangeFloor: React.Dispatch<React.SetStateAction<string | null>>;
  floorItems: { label: string; value: string }[];
}

const BuildingFloorSettingsModal: React.FC<IBuildingFloorSettingsModalProps> = ({
  visible,
  onRequestClose,
  selectedBuilding,
  onChangeBuilding,
  buildingItems,
  selectedFloor,
  onChangeFloor,
  floorItems,
}) => {
  const [openBuilding, setOpenBuilding] = useState(false);
  const [openFloor, setOpenFloor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Correctly typed handler for building changes with loading overlay.
  const handleBuildingChange: React.Dispatch<React.SetStateAction<string | null>> = (value) => {
    setIsLoading(true);
    let newValue: string | null;
    if (typeof value === 'function') {
      newValue = value(selectedBuilding);
    } else {
      newValue = value;
    }
    onChangeBuilding(newValue);
    // Simulate an async operation (replace with your actual async logic)
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} onPress={onRequestClose} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Settings</Text>
          <Text style={styles.label}>Select Building:</Text>
          <BuildingDropdown
            label="Building"
            open={openBuilding}
            setOpen={setOpenBuilding}
            value={selectedBuilding}
            setValue={handleBuildingChange}
            items={buildingItems}
          />
          <Text style={styles.label}>Select Floor:</Text>
          <FloorDropdown
            label="Floor"
            open={openFloor}
            setOpen={setOpenFloor}
            value={selectedFloor}
            setValue={onChangeFloor}
            items={floorItems}
            disabled={floorItems.length === 0}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onRequestClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#912338" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default BuildingFloorSettingsModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    zIndex: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#666',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
