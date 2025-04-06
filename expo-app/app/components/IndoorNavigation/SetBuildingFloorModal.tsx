import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  BuildingDropdown,
  FloorDropdown,
} from "@/app/components/IndoorNavigation/DropDownPicker";

export interface IBuildingFloorSettingsModalHandles {
  handleOpenBuilding: (open: boolean | ((prev: boolean) => boolean)) => void;
  handleOpenFloor: (open: boolean | ((prev: boolean) => boolean)) => void;
  handleBuildingChange: (
    value: string | null | ((prev: string | null) => string | null)
  ) => void;
  getOpenBuilding: () => boolean;
  getOpenFloor: () => boolean;
}

export interface IBuildingFloorSettingsModalProps {
  visible: boolean;
  onRequestClose: () => void;

  selectedBuilding: string | null;
  onChangeBuilding: React.Dispatch<React.SetStateAction<string | null>>;
  buildingItems: { label: string; value: string }[];

  selectedFloor: string | null;
  onChangeFloor: React.Dispatch<React.SetStateAction<string | null>>;
  floorItems: { label: string; value: string }[];

  testID?: string;
}

const BuildingFloorSettingsModal = forwardRef<
  IBuildingFloorSettingsModalHandles,
  IBuildingFloorSettingsModalProps
>(
  (
    {
      visible,
      onRequestClose,
      selectedBuilding,
      onChangeBuilding,
      buildingItems,
      selectedFloor,
      onChangeFloor,
      floorItems,
      testID,
    },
    ref
  ) => {
    const [openBuilding, setOpenBuilding] = useState<boolean>(false);
    const [openFloor, setOpenFloor] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleOpenBuilding: React.Dispatch<React.SetStateAction<boolean>> = (
      openValueOrUpdater
    ) => {
      const newValue =
        typeof openValueOrUpdater === "function"
          ? openValueOrUpdater(openBuilding)
          : openValueOrUpdater;
      setOpenBuilding(newValue);
      if (newValue) {
        setOpenFloor(false);
      }
    };

    const handleOpenFloor: React.Dispatch<React.SetStateAction<boolean>> = (
      openValueOrUpdater
    ) => {
      const newValue =
        typeof openValueOrUpdater === "function"
          ? openValueOrUpdater(openFloor)
          : openValueOrUpdater;
      setOpenFloor(newValue);
      if (newValue) {
        setOpenBuilding(false);
      }
    };

    const handleBuildingChange: React.Dispatch<
      React.SetStateAction<string | null>
    > = (value) => {
      setIsLoading(true);
      let newValue: string | null;
      if (typeof value === "function") {
        newValue = value(selectedBuilding);
      } else {
        newValue = value;
      }
      onChangeBuilding(newValue);
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    useImperativeHandle(ref, () => ({
      handleOpenBuilding,
      handleOpenFloor,
      handleBuildingChange,
      getOpenBuilding: () => openBuilding,
      getOpenFloor: () => openFloor,
    }));

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onRequestClose}
        testID={testID ?? "buildingFloorSettingsModal"}
      >
        <View style={styles.backdrop} testID="bfsBackdrop">
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={onRequestClose}
            testID="bfsBackdropTouchable"
          />
          <View style={styles.modalCard} testID="bfsModalCard">
            <Text style={styles.modalTitle} testID="bfsModalTitle">
              Settings
            </Text>
            <Text style={styles.label} testID="bfsBuildingLabel">
              Select Building:
            </Text>
            {/* Building container with higher zIndex */}
            <View style={styles.buildingContainer}>
              <BuildingDropdown
                testID="buildingDropdown"
                label="Building"
                open={openBuilding}
                setOpen={handleOpenBuilding}
                value={selectedBuilding}
                setValue={handleBuildingChange}
                items={buildingItems}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
            <Text style={styles.label} testID="bfsFloorLabel">
              Select Floor:
            </Text>
            {/* Floor container */}
            <View style={styles.floorContainer}>
              <FloorDropdown
                testID="floorDropdown"
                label="Floor"
                open={openFloor}
                setOpen={handleOpenFloor}
                value={selectedFloor}
                setValue={onChangeFloor}
                items={floorItems}
                disabled={floorItems.length === 0}
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onRequestClose}
              testID="bfsCloseButton"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            {isLoading && (
              <View style={styles.loadingOverlay} testID="bfsLoadingOverlay">
                <ActivityIndicator size="large" color="#912338" />
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }
);

export default BuildingFloorSettingsModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    zIndex: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: "#666",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 20,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  buildingContainer: {
    zIndex: 3000,
    marginBottom: 10,
  },
  floorContainer: {
    zIndex: 2000,
    marginBottom: 10,
  },
});
