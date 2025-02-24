import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Campus } from "@/app/utils/types";

interface HamburgerWidgetProps {
  toggleCampus: () => void;
  viewCampusMap: boolean;
  campus: Campus;
  setViewCampusMap: React.Dispatch<React.SetStateAction<boolean>>;
}

const HamburgerWidget: React.FC<HamburgerWidgetProps> = ({
  toggleCampus,
  viewCampusMap,
  setViewCampusMap,
  campus,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleThemeChange = (value: boolean) => {
    setIsDarkMode(value);
  };

  return (
    <View style={styles.container}>
      
      {/* Hamburger Button Fixed on the Right */}
      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={toggleVisibility}
        testID="hamburger-button"
      >
        <MaterialIcons name="menu" size={25} color="black" />
      </TouchableOpacity>

      {/* The hidden menu options */}
      {isVisible && (
        <View style={styles.exposedOptions} testID="menu-options">
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={toggleCampus}
            testID="toggle-campus-button"
          >
            <View style={styles.row}>
              <MaterialIcons name="arrow-upward" size={16} color="black" />
              <MaterialIcons name="arrow-downward" size={16} color="black" />
              <Text style={styles.buttonText}>
                View {campus === "SGW" ? "Loyola Campus" : "SGW Campus"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Campus Map Switch */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>View Campus Map</Text>
            <Switch
              value={viewCampusMap}
              onValueChange={() => setViewCampusMap((prevValue: boolean) => !prevValue)}
              testID="campus-map-switch"
            />
          </View>

          {/* Dark Mode Switch */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeChange}
              testID="dark-mode-switch"
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
    alignItems: "flex-end", // Ensures alignment to the right
    zIndex: 10,
  },
  hamburgerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 8,
    elevation: 3, // Adds a shadow on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  exposedOptions: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "gray",
    marginTop: 10, // Space between the menu button and the box
    width: 220,
    elevation: 5, // Adds a shadow effect on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
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
    marginLeft: 8, // Space between icons and text
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Aligns text to left and switch to right
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  switchText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default HamburgerWidget;
