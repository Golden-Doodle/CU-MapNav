import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";

export const defaultFilters = ["restaurant", "cafe", "washroom"];

interface FilterModalProps {
  visible: boolean;
  onApply: (filters: string[]) => void;
  onClose: () => void;
  testID?: string;
}

const availableFilters = [
  { key: "restaurant", label: "Restaurants" },
  { key: "cafe", label: "Cafes" },
  { key: "washroom", label: "Washrooms" },
];

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onApply,
  onClose,
  testID = "filter-modal",
}) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(defaultFilters);

  const toggleFilter = (filterKey: string) => {
    if (selectedFilters.includes(filterKey)) {
      setSelectedFilters(selectedFilters.filter((key) => key !== filterKey));
    } else {
      setSelectedFilters([...selectedFilters, filterKey]);
    }
  };

  const handleApply = () => {
    onApply(selectedFilters);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" testID={testID}>
      <View style={styles.modalBackground} testID={`${testID}-background`}>
        <View style={styles.modalContainer} testID={`${testID}-container`}>
          <Text style={styles.title} testID={`${testID}-title`}>Filter Places</Text>
          {availableFilters.map((filter) => (
            <View
              key={filter.key}
              style={styles.filterRow}
              testID={`${testID}-filter-row-${filter.key}`}
            >
              <Text style={styles.filterLabel} testID={`${testID}-filter-label-${filter.key}`}>
                {filter.label}
              </Text>
              <Switch
                value={selectedFilters.includes(filter.key)}
                onValueChange={() => toggleFilter(filter.key)}
                trackColor={{ false: "#767577", true: "#8C2633" }}
                thumbColor={selectedFilters.includes(filter.key) ? "#fff" : "#f4f3f4"}
                testID={`${testID}-switch-${filter.key}`}
              />
            </View>
          ))}
          <View style={styles.buttonRow} testID={`${testID}-button-row`}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleApply}
              testID={`${testID}-apply-button`}
            >
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              testID={`${testID}-cancel-button`}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    backgroundColor: "rgba(145,35,56,1)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default FilterModal;