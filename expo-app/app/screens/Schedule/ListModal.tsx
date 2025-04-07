import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

interface ListModalProps {
  visible: boolean;
  onClose: () => void;
  routeSteps: string[];
}

const ListModal: React.FC<ListModalProps> = ({ visible, onClose, routeSteps }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent testID="list-modal">
      <View style={styles.modalBackground} testID="modal-background">
        <View style={styles.modalContainer} testID="modal-container">
          <Text style={styles.title} testID="modal-title">Optimized Route</Text>
          <FlatList
            data={routeSteps}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.routeStep} testID="route-step">
                {item}
              </Text>
            )}
            testID="route-steps-list"
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose} testID="close-button">
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "80%",
    maxHeight: "80%",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  routeStep: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#912338",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default ListModal;
