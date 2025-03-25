import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";

interface RadiusAdjusterProps {
  visible: boolean;
  initialValue: number;
  onApply: (value: number) => void;
  onReset: () => void;
  onClose: () => void;
  testID?: string;
}

const RadiusAdjuster: React.FC<RadiusAdjusterProps> = ({
  visible,
  initialValue,
  onApply,
  onReset,
  onClose,
  testID,
}) => {
  const [radius, setRadius] = useState<number>(initialValue);
  const baseTestID = testID || "radius-adjuster";

  useEffect(() => {
    setRadius(initialValue);
  }, [initialValue]);

  return (
    <Modal visible={visible} animationType="slide" transparent testID={`${baseTestID}-modal`}>
      <View style={styles.modalOverlay} testID={`${baseTestID}-modal-overlay`}>
        <View style={styles.modalContainer} testID={`${baseTestID}-modal-container`}>
          <Text style={styles.title} testID={`${baseTestID}-title-text`}>
            Set Search Radius
          </Text>
          <Text style={styles.radiusText} testID={`${baseTestID}-radius-text`}>
            {radius} meters
          </Text>
          <Slider
            style={styles.slider}
            testID={`${baseTestID}-radius-slider`}
            minimumValue={100}
            maximumValue={2000}
            value={radius}
            step={50}
            onValueChange={setRadius}
            minimumTrackTintColor="rgba(145,35,56,1)"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="rgba(145,35,56,1)"
          />
          <View style={styles.buttonContainer} testID={`${baseTestID}-button-container`}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={() => {
                setRadius(100);
                onReset();
              }}
              testID={`${baseTestID}-reset-button`}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={() => {
                onApply(radius);
                onClose();
              }}
              testID={`${baseTestID}-apply-button`}
            >
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} testID={`${baseTestID}-close-button`}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  radiusText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "#d3d3d3",
  },
  applyButton: {
    backgroundColor: "rgba(145,35,56,1)",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  closeButton: {
    marginTop: 15,
  },
  closeText: {
    color: "rgba(145,35,56,1)",
    fontSize: 16,
  },
});

export default RadiusAdjuster;