import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Building } from "../../utils/types";

interface NavTabProps {
  campus: "SGW" | "Loyola";
  selectedBuilding: Building | null;
  onNavigatePress?: () => void;
  onTravelPress?: () => void;
  onEatPress?: () => void;
  onNextClassPress?: () => void;
  onMoreOptionsPress?: () => void;
  onInfoPress?: () => void;
  onBackPress?: () => void;
  onDirectionsPress?: () => void;
}

const NavTab: React.FC<NavTabProps> = ({
  campus,
  selectedBuilding,
  onNavigatePress,
  onTravelPress,
  onEatPress,
  onNextClassPress,
  onMoreOptionsPress,
  onInfoPress,
  onBackPress,
  onDirectionsPress,
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const NAV_ITEMS = selectedBuilding
    ? [
        { label: "Back", icon: "arrow-left", action: onBackPress },
        { label: "Info", icon: "info-circle", action: onInfoPress },
        { label: "Directions", icon: "route", action: onDirectionsPress },
      ]
    : [
        { label: "Navigate", icon: "compass", action: onNavigatePress },
        {
          label: campus === "SGW" ? "Loyola" : "SGW",
          icon: "location-arrow",
          action: onTravelPress,
        },
        { label: "Eat", icon: "utensils", action: onEatPress },
        { label: "Class", icon: "calendar-alt", action: onNextClassPress },
        { label: "More", icon: "ellipsis-h", action: onMoreOptionsPress },
      ];

  return (
    <View style={styles.navContainer}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.navItem}
          onPress={() => {
            setActiveTab(item.label);
            item.action && item.action();
          }}
        >
          <FontAwesome5 name={item.icon} size={24} color={activeTab === item.label ? "#fff" : "#ddd"} />
          <Text style={[styles.navText, activeTab === item.label && styles.activeText]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(145, 35, 56, 1)",
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: "#731b2b",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    maxWidth: 80,
  },
  navText: {
    fontSize: 16,
    color: "#ddd",
    marginTop: 3,
    flexWrap: "nowrap",
    textAlign: "center",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default NavTab;
