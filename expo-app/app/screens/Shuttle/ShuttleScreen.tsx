import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import ShuttleHeader from "../../components/ShuttleSchedule/ShuttleHeader";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import ShuttleSchedule from "../../components/ShuttleSchedule/ShuttleSchedule";

export default function ShuttleScreen() {
    const [selectedRoute, setSelectedRoute] = useState<"LOY" | "SGW">("SGW");
    const [isEnabled, setIsEnabled] = useState(selectedRoute === "SGW");

    const toggleSwitch = () => {
        const newRoute = isEnabled ? "LOY" : "SGW";
        setSelectedRoute(newRoute);
        setIsEnabled(!isEnabled);
    };

    return (
        <View style={styles.container}>
            <ShuttleHeader />

            {/* 🚀 Shuttle Route Toggle Switch */}
            <View style={styles.switchContainer}>
                <Text style={[styles.switchText, selectedRoute === "LOY" && styles.activeText]} testID="LOY-text">LOY</Text>
                <Switch
                    trackColor={{ false: "#ddd", true: "#912338" }}
                    thumbColor={"#fff"}
                    ios_backgroundColor="#ddd"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                    testID="route-switch"
                />
                <Text style={[styles.switchText, selectedRoute === "SGW" && styles.activeText]} testID="SGW-text">SGW</Text>
            </View>

            {/* 🔄 Shuttle Schedule */}
            <ShuttleSchedule route={selectedRoute} testID="ShuttleSchedule" />

            <BottomNavigation testID="bottom-navigation"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        justifyContent: "space-between",
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    switchText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#999",
        marginHorizontal: 10,
    },
    activeText: {
        color: "#912338",
    },
});
