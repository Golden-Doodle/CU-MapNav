import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Building } from "@/app/utils/types";
import { useTranslation } from "react-i18next";
import IndoorMap from "@/app/components/IndoorNavigation/IndoorMap";

type BuildingInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedBuilding: Building | null | undefined;
  onNavigate: (latitude: number, longitude: number) => void;
  testID: string;
  onUseAsOrigin: () => void;
};

const BuildingInfoModal: React.FC<BuildingInfoModalProps> = ({
  visible,
  onClose,
  selectedBuilding,
  onNavigate,
  testID,
  onUseAsOrigin,
}) => {
  const { t } = useTranslation("CampusMap");
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isIndoorMapVisible, setIsIndoorMapVisible] = useState<boolean>(false);
  const [indoorBuildingId, setIndoorBuildingId] = useState<string | null>(null);

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

  const handleShowIndoors = () => {
    if (!["H", "MB", "JMSB"].includes(selectedBuilding.id)) {
      Alert.alert(
        t("Indoor Map Not Available"),
        t("Indoor map is not available for this building.")
      );
      return;
    }

    setIndoorBuildingId(selectedBuilding.id);
    setIsIndoorMapVisible(true);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay} testID={`${testID}-overlay`}>
          <View style={styles.modalContent} testID={`${testID}-content`}>
            {/* Modal Header */}
            <View style={styles.modalHeader} testID={`${testID}-header`}>
              <Text style={styles.modalTitle} testID={`${testID}-title`}>
                {selectedBuilding.name}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                testID={`${testID}-close-button`}
              >
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody} testID={`${testID}-body`}>
              {selectedBuilding?.photoUrl && (
                <>
                  {isImageLoading && (
                    <ActivityIndicator
                      size="large"
                      color="#912338"
                      style={styles.spinner}
                      testID={`${testID}-spinner`}
                    />
                  )}
                  <Image
                    source={{ uri: selectedBuilding.photoUrl }}
                    style={styles.image}
                    onLoadStart={handleImageLoadStart}
                    onLoadEnd={handleImageLoadEnd}
                    testID={`${testID}-building-image`}
                  />
                </>
              )}
              <Text
                style={styles.modalDescription}
                testID={`${testID}-description`}
              >
                {selectedBuilding.description || t("No description available")}
              </Text>
              {selectedBuilding?.rating && (
                <Text style={styles.rating} testID={`${testID}-rating`}>
                  {t("Rating")}: {selectedBuilding.rating} ★
                </Text>
              )}
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter} testID={`${testID}-footer`}>
              {selectedBuilding.coordinates.length > 0 && (
                <>
                  <TouchableOpacity
                    style={styles.navigateButton}
                    onPress={onUseAsOrigin}
                    testID={`${testID}-use-as-origin-button`}
                  >
                    <Text style={styles.navigateButtonText}>
                      {t("Use as origin")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navigateButton}
                    onPress={handleNavigate}
                    testID={`${testID}-navigate-button`}
                  >
                    <Text style={styles.navigateButtonText}>
                      {t("Navigate to this Building")}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={handleShowIndoors}
                testID={`${testID}-show-indoors-button`}
              >
                <Text style={styles.navigateButtonText}>
                  {t("Show Indoors")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Indoor Map Modal */}
      <Modal
        visible={isIndoorMapVisible}
        animationType="slide"
        onRequestClose={() => setIsIndoorMapVisible(false)}
      >
        <View style={{ flex: 1 }}>
          {/* Pass the building id as received; IndoorMap will handle mapping if necessary */}
          <IndoorMap indoorBuildingId={indoorBuildingId || undefined} />
          <TouchableOpacity
            onPress={() => setIsIndoorMapVisible(false)}
            style={styles.closeIndoorMapButton}
          >
            <Text style={styles.closeButtonText}>
              {t("Close Indoor Map")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
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
    marginVertical: 5,
    borderRadius: 8,
    elevation: 3,
    alignItems: "center",
    width: "100%",
  },
  navigateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeIndoorMapButton: {
    backgroundColor: "#912338",
    padding: 12,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default BuildingInfoModal;