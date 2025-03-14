import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Building, Campus, LocationType } from "@/app/utils/types";

interface NavTabProps {
  campus: Campus;
  destination: LocationType;
  onSearchPress?: () => void;
  onTravelPress?: () => void;
  onEatPress?: () => void;
  onNextClassPress?: () => void;
  onMoreOptionsPress?: () => void;
  onInfoPress?: () => void;
  onBackPress?: () => void;
  onDirectionsPress?: () => void;
  testID: string; 
}

const NavTab: React.FC<NavTabProps> = ({
  campus,
  destination,
  onSearchPress,
  onTravelPress,
  onEatPress,
  onNextClassPress,
  onMoreOptionsPress,
  onInfoPress,
  onBackPress,
  onDirectionsPress,
  testID, 
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const getNavItems = () => {
    // No Destination
    if (!destination) return [
        { label: "Search", icon: "search", action: onSearchPress },
        {
          label: campus,
          icon: "location-arrow",
          action: onTravelPress,
        },
        { label: "Eat", icon: "utensils", action: onEatPress },
        { label: "Class", icon: "calendar-alt", action: onNextClassPress },
        { label: "More", icon: "ellipsis-h", action: onMoreOptionsPress },
      ];
      
    // Selected Building
    if (destination.building) return [
        { label: "Back", icon: "arrow-left", action: onBackPress },
        { label: "Info", icon: "info-circle", action: onInfoPress },
        { label: "Directions", icon: "route", action: onDirectionsPress },
      ];
    
    if (destination.coordinates) return [
        { label: "Back", icon: "arrow-left", action: onBackPress },
        { label: "Directions", icon: "route", action: onDirectionsPress },
      ];

    return [];
  };

  const NAV_ITEMS = getNavItems();

  return (
    <View style={styles.navContainer} testID={`${testID}-nav-container`}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.navItem}
          onPress={() => {
            setActiveTab(item.label);
            item.action && item.action();
          }}
          testID={`${testID}-nav-item-${item.label}`} 
        >
          <FontAwesome5 
            name={item.icon} 
            size={24} 
            color={activeTab === item.label ? "#fff" : "#ddd"} 
            testID={`${testID}-icon-${item.label}`} 
          />
          <Text style={[styles.navText, activeTab === item.label && styles.activeText]} testID={`${testID}-nav-text-${item.label}`}>
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
