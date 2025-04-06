import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface ShuttleScheduleProps {
  route: "LOY" | "SGW";
  testID?: string;
}

// TODO: Move this to function helper file
/**
 * Helper: Parse a 12-hour time string like "9:15 AM" → Date object (today).
 */
function parseTime12ToDate(time12: string): Date {
  const [time, modifier] = time12.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hours < 12) {
    hours += 12;
  }
  if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );
}

const ShuttleSchedule: FC<ShuttleScheduleProps> = (props) => {
  const { route, testID } = props;
  const { t } = useTranslation("HomePageScreen");

  const [schedule, setSchedule] = useState<string[]>([]);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const schedules: Record<"LOY" | "SGW", string[]> = {
    LOY: [
      "9:15 AM",
      "9:45 AM",
      "10:15 AM",
      "11:15 AM",
      "11:45 AM",
      "12:15 PM",
      "12:45 PM",
      "1:15 PM",
      "1:45 PM",
      "2:15 PM",
      "2:45 PM",
      "3:15 PM",
      "3:45 PM",
      "4:15 PM",
      "4:45 PM",
      "5:45 PM",
      "6:15 PM",
      "6:45 PM",
    ],
    SGW: [
      "9:15 AM",
      "9:45 AM",
      "10:15 AM",
      "10:45 AM",
      "11:45 AM",
      "12:15 PM",
      "12:45 PM",
      "1:15 PM",
      "1:45 PM",
      "2:15 PM",
      "2:45 PM",
      "3:15 PM",
      "3:45 PM",
      "4:15 PM",
      "5:15 PM",
      "5:45 PM",
      "6:15 PM",
      "6:45 PM",
    ],
  };

  useEffect(() => {
    setSelectedTime(null);
    if (route in schedules) {
      setSchedule(schedules[route]);
    }
  }, [route]);

  const isPastTime = (timeStr: string): boolean => {
    const now = new Date();
    const shuttleTime = parseTime12ToDate(timeStr);
    return shuttleTime < now;
  };

  const renderInfoPanel = () => (
    <View
      style={styles.infoPanel}
      testID={testID ? `${testID}-info-panel` : undefined}
    >
      <Text style={styles.infoPanelTitle}>{t("Pickup Location")}</Text>
      <Text style={styles.infoPanelDetails}>
        Henry F Hall building, front doors
      </Text>
      <Text style={styles.infoPanelDetails}>1455 De Maisonneuve Blvd. W</Text>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, styles.badgeYellow]}>
          <Text style={styles.badgeText}>{t("Limited Seats")}</Text>
        </View>
        <View style={[styles.badge, styles.badgeGreen]}>
          <Text style={styles.badgeText}>{t("On Time")}</Text>
        </View>
      </View>
    </View>
  );

  if (!schedule || schedule.length === 0) {
    return (
      <View
        style={styles.noScheduleContainer}
        testID={testID ? `${testID}-no-schedule-container` : undefined}
      >
        <Text style={styles.errorText}>{t("No schedule available.")}</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1 }}
      testID={testID ? `${testID}-shuttle-schedule-container` : undefined}
    >
      {/* NEW: ID Card Notice at top */}
      <View
        style={styles.idCardNotice}
        testID={testID ? `${testID}-id-card-notice` : undefined}
      >
        <FontAwesome5
          name="id-card"
          size={18}
          color="#666"
          style={styles.idCardIcon}
          testID={testID ? `${testID}-id-card-icon` : undefined}
        />
        <Text
          style={styles.idCardNoticeText}
          testID={testID ? `${testID}-id-card-notice-text` : undefined}
        >
          {t("ID Card is obligatory to board the shuttle.")}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        testID={testID ? `${testID}-schedule-scrollview` : undefined}
      >
        {/**
         * Map over all times. For each time:
         * - If it's in the past, show grey (and disable).
         * - Otherwise show red, clickable.
         * - If user clicks on a time that is not the selectedTime, set it as selectedTime.
         *   If they click the same time again, close it (setSelectedTime(null)).
         * - If the time is selectedTime, render the info panel below it.
         */}
        {schedule.map((time, idx) => {
          const past = isPastTime(time);
          const isSelected = time === selectedTime;
          return (
            <View
              key={idx}
              style={styles.timeRow}
              testID={testID ? `${testID}-time-row-${time}` : undefined}
            >
              <TouchableOpacity
                style={[
                  styles.timeButton,
                  past ? styles.timeButtonPast : styles.timeButtonFuture,
                ]}
                disabled={past}
                onPress={() => {
                  if (isSelected) {
                    setSelectedTime(null);
                  } else {
                    setSelectedTime(time);
                  }
                }}
                testID={testID ? `${testID}-time-button-${time}` : undefined}
              >
                <Text
                  style={[styles.timeText, past && styles.timeTextPast]}
                  testID={testID ? `${testID}-time-text-${time}` : undefined}
                >
                  {time}
                </Text>
              </TouchableOpacity>

              {isSelected && renderInfoPanel()}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 20,
    alignItems: "center",
  },

  noScheduleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#912338",
  },

  idCardNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
  },
  idCardIcon: {
    marginRight: 8,
  },
  idCardNoticeText: {
    fontSize: 14,
    color: "#666",
  },

  timeRow: {
    width: "90%",
    marginBottom: 10,
  },
  timeButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  timeButtonPast: {
    backgroundColor: "#ccc",
  },
  timeButtonFuture: {
    backgroundColor: "#912338",
  },
  timeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  timeTextPast: {
    color: "#666",
  },
  infoPanel: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  infoPanelDetails: {
    fontSize: 14,
    color: "#444",
    marginBottom: 2,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  badgeYellow: {
    backgroundColor: "#FFD700",
  },
  badgeGreen: {
    backgroundColor: "#4CAF50",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ShuttleSchedule;
