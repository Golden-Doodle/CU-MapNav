import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { GoogleCalendarEvent } from "@/app/utils/types";
import { Calendar, DateData } from "react-native-calendars";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import { fetchCalendarEvents } from "../../services/GoogleCalendar/fetchingUserCalendarData"; // Ensure the correct import
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function ScheduleScreen() {

    const  {t} = useTranslation("ScheduleScreen");

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [visibleMonth, setVisibleMonth] = useState(selectedDate); // Track visible month
    const [markedDates, setMarkedDates] = useState<{ [key: string]: { marked: boolean, dotColor?: string } }>({});
    const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
    const [scheduleName, setScheduleName] = useState<string>("");

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { scheduleName, events } = await fetchCalendarEvents();
            setScheduleName(scheduleName);
            setEvents(events);

            const newMarkedDates: { [key: string]: { marked: boolean, dotColor: string } } = {};
            events.forEach(event => {
                const eventDate = event.start.dateTime.split("T")[0];
                newMarkedDates[eventDate] = { marked: true, dotColor: "#912338" };
            });

            setMarkedDates(newMarkedDates);
        } catch (error) {
            console.error("Error fetching calendar events:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    };

    // Filter events for the selected date
    const eventsForSelectedDate = events.filter(event =>
        event.start.dateTime.split("T")[0] === selectedDate
    );

    return (
      <View style={styles.container} testID="container">
        <View style={styles.header} testID="header">
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            testID="backButton"
          >
            <FontAwesome5 name="arrow-left" size={30} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText} testID="headerText">
            {t("My Calendar")}
          </Text>
        </View>

        <View style={styles.formContainer} testID="formContainer">
          {loading ? (
            <ActivityIndicator size="large" color="#912338" style={styles.loader} testID="loader" />
          ) : (
            <FlatList
              data={eventsForSelectedDate}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  testID="refreshControl"
                />
              }
              ListHeaderComponent={() => (
                <>
                  <Text style={styles.scheduleName} testID="scheduleName">
                    {t("Calendar Name")}:{" "}
                    <Text style={styles.scheduleNameHighlight}>{scheduleName}</Text>
                  </Text>

                  <View style={styles.divider} testID="divider" />
                  <Calendar
                    initialDate={visibleMonth}
                    markedDates={markedDates}
                    onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                    onMonthChange={(month: DateData) => setVisibleMonth(month.dateString)}
                    theme={{
                      selectedDayBackgroundColor: "#912338",
                      todayTextColor: "#912338",
                      arrowColor: "#912338",
                      dotColor: "#912338",
                      textSectionTitleColor: "#912338",
                    }}
                    testID="calendar"
                  />

                  <View style={styles.divider} testID="divider" />

                  <Text style={styles.dateTitle} testID="dateTitle">
                    {t("Events on")} {selectedDate}:
                  </Text>
                  {eventsForSelectedDate.length === 0 && (
                    <Text style={styles.noEventsText} testID="noEventsText">
                      {t("No events on this day.")}
                    </Text>
                  )}
                </>
              )}
              renderItem={({ item }) => (
                <View style={styles.eventItem} testID="eventItem">
                  <Text style={styles.eventTitle} testID="eventTitle">
                    {item.summary}
                  </Text>
                  <Text style={styles.eventTime} testID="eventTime">
                    {new Date(item.start.dateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -
                    {new Date(item.end.dateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        paddingTop: 20,
        paddingHorizontal: 15,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingBottom: 60,
    },
    scheduleName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginVertical: 10,
    },
    dateTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginVertical: 10,
    },
    noEventsText: {
        fontSize: 16,
        color: "#912338",
        textAlign: "center",
        marginTop: 10,
        fontWeight: "600",
    },
    listContainer: {
        paddingBottom: 20,
    },
    eventItem: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#912338",
    },
    eventTime: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        position: "relative",
        marginTop: 30
    },
    headerText: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    backButton: {
        position: "absolute",
        left: 0,
        paddingLeft: 10,
    },
    formContainer: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    scheduleNameHighlight: {
        color: "#912338",
    },
    divider: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 20,
        width: "100%",
    },
});
