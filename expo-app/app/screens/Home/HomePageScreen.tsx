import React, { useContext } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Text, Switch } from "react-native";
import Header from "../../components/Header/Header";
import ButtonSection from "../../components/ButtonSection/ButtonSection";
import SearchBar from "../../components/SearchBar/SearchBar";
import QuickShortcuts from "../../components/QuickShortcuts/QuickShortcuts";
import HottestSpots from "../../components/HottestSpots/HottestSpots";
import ShuttleSchedule from "../../components/ShuttleSchedule/ShuttleSchedule";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import { AuthContext } from "@/app/contexts/AuthContext";
import { useCalendarEvents } from "@/app/hooks/useCalendarEvents";
import { useCampus } from "@/app/hooks/useCampus";

export default function HomePageScreen() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const { events, loading, refresh } = useCalendarEvents(user?.uid ?? null);
  const { campus, toggle } = useCampus();

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        <Header refreshCalendarEvents={refresh} isLoading={loading} calendarEvents={events} />
        <ButtonSection />
        <SearchBar />
        <QuickShortcuts />
        <HottestSpots />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>SGW</Text>
          <Switch value={campus === "LOY"} onValueChange={toggle} />
          <Text style={styles.switchLabel}>LOY</Text>
        </View>

        <ShuttleSchedule route={campus} />
      </ScrollView>
      <BottomNavigation testID="bottom-navigation" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "space-between",
  },
  content: {
    alignItems: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
    color: "#333",
  },
});
