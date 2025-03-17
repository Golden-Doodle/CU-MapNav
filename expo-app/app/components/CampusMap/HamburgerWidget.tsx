import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Campus } from "@/app/utils/types";

const primaryColor = "rgba(145,35,56,1)";

interface HamburgerWidgetProps {
  toggleCampus: () => void;
  viewCampusMap: boolean;
  campus: Campus;
  setViewCampusMap: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  testID: string; 
}

const HamburgerWidget: React.FC<HamburgerWidgetProps> = ({
  toggleCampus,
  viewCampusMap,
  setViewCampusMap,
  campus,
  darkMode,
  onDarkModeChange,
  testID, 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleDarkModeChange = (value: boolean) => {
    console.log("Dark mode toggled:", value);
    onDarkModeChange(value);
    // Do not change isVisible here; let the menu remain open if desired.
  };

  return (
    <View style={styles.container} testID={`${testID}-container`}>
      {/* Hamburger Button Fixed on the Right */}
      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={toggleVisibility}
        testID={`${testID}-hamburger-button`}
      >
        <MaterialIcons name="menu" size={25} color="#fff" />
      </TouchableOpacity>

      {/* The hidden menu options */}
      {isVisible && (
        <View style={styles.exposedOptions} testID={`${testID}-menu-options`}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={toggleCampus}
            testID={`${testID}-toggle-campus-button`}
          >
            <View style={styles.row}>
              <MaterialIcons name="arrow-upward" size={16} color={primaryColor} />
              <MaterialIcons name="arrow-downward" size={16} color={primaryColor} />
              <Text style={styles.buttonText} testID="campus-name">
                View {campus === "SGW" ? "Loyola Campus" : "SGW Campus"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Campus Map Switch */}
          <View style={styles.switchContainer} testID={`${testID}-campus-map-switch-container`}>
            <Text style={styles.switchText} testID={`${testID}-switch-text`}>
              View Campus Map
            </Text>
            <Switch
              value={viewCampusMap}
              onValueChange={() => setViewCampusMap((prev) => !prev)}
              trackColor={{ false: "#d3d3d3", true: primaryColor }}
              thumbColor="#fff"
              testID={`${testID}-campus-map-switch`}
            />
          </View>

          {/* Dark Mode Switch */}
          <View style={styles.switchContainer} testID={`${testID}-dark-mode-switch-container`}>
            <Text style={styles.switchText} testID={`${testID}-dark-mode-text`}>
              Dark Mode
            </Text>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeChange}
              trackColor={{ false: "#d3d3d3", true: primaryColor }}
              thumbColor="#fff"
              testID={`${testID}-dark-mode-switch`}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 55,
    right: 5,
    alignItems: "flex-end",
    zIndex: 10,
  },
  hamburgerButton: {
    backgroundColor: primaryColor,
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  exposedOptions: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: primaryColor,
    marginTop: 10,
    width: 220,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 8,
    color: primaryColor,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  switchText: {
    fontSize: 10,
    fontWeight: "bold",
    color: primaryColor,
  },
});

export default HamburgerWidget;
