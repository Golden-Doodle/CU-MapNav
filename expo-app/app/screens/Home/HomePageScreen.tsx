import React from "react";
import { View, StyleSheet } from "react-native";
import Header from "../../components/Header/Header";
import ButtonSection from "../../components/ButtonSection/ButtonSection";
import SearchBar from "../../components/SearchBar/SearchBar";
import QuickShortcuts from "../../components/QuickShortcuts/QuickShortcuts";
import HottestSpots from "../../components/HottestSpots/HottestSpots";
import ShuttleSchedule from "../../components/ShuttleSchedule/ShuttleSchedule";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import { AuthContext } from "@/app/contexts/AuthContext";

export default function HomePageScreen() {
  const auth = React.useContext(AuthContext);

  const user = auth?.user;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Header />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <ButtonSection />
        <SearchBar />
        <QuickShortcuts />
        <HottestSpots />
        <ShuttleSchedule />
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "space-between",
  },
  headerContainer: {},
  content: {
    marginTop: 250,
    alignItems: "center",
  },
});
