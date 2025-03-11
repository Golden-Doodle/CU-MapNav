import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Building } from "../../../utils/types";

type BuildingInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedBuilding: Building | null | undefined;
  onNavigate?: (latitude: number, longitude: number) => void; 
};

const BuildingInfoModal: React.FC<BuildingInfoModalProps> = ({
  visible,
  onClose,
  selectedBuilding,
  onNavigate,
}) => {
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  if (!selectedBuilding) return null;

  const handleNavigate = () => {
    if (onNavigate && selectedBuilding?.coordinates?.length) {
      const { latitude, longitude } = selectedBuilding.coordinates[0];
      onNavigate(latitude, longitude);
      onClose();
    }
  };

  const handleImageLoadStart = () => {
    setIsImageLoading(true);
  };

  const handleImageLoadEnd = () => {
    setIsImageLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedBuilding.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="close-button">
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Modal Body */}
          <View style={styles.modalBody}>
            {/* Display restaurant photo if available */}
            {selectedBuilding?.photoUrl && (
              <>
                {isImageLoading && (
                  <ActivityIndicator
                    size="large"
                    color="#912338"
                    style={styles.spinner}
                    testID="spinner" 
                  />
                )}
                <Image
                  source={{ uri: selectedBuilding.photoUrl }}
                  style={styles.image}
                  onLoadStart={handleImageLoadStart}
                  onLoadEnd={handleImageLoadEnd}
                  testID="building-image"
                />
              </>
            )}
            {/* Display building/restaurant description */}
            <Text style={styles.modalDescription}>
              {selectedBuilding.description || "No description available"}
            </Text>

            {/* Display restaurant rating if available */}
            {selectedBuilding?.rating && (
              <Text style={styles.rating}>Rating: {selectedBuilding.rating} ★</Text>
            )}
          </View>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            {onNavigate && selectedBuilding.coordinates.length > 0 && (
              <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
                <Text style={styles.navigateButtonText}>Navigate to this Building</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#912338",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 16,
    alignItems: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
    textAlign: "center",
  },
  rating: {
    fontSize: 18,
    color: "#555",
    marginTop: 10,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: "cover",
  },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -25,
    marginTop: -25,
  },
  modalFooter: {
    padding: 16,
    alignItems: "center",
  },
  navigateButton: {
    backgroundColor: "#912338",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  navigateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BuildingInfoModal;
