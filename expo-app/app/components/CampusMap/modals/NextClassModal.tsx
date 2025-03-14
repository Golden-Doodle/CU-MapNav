import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  GoogleCalendarEvent,
  LocationType,
  RoomLocation,
} from "@/app/utils/types";
import { SGWBuildings, LoyolaBuildings } from "../data/buildingData";
import { fetchTodaysEventsFromSelectedSchedule } from "@/app/services/GoogleCalendar/fetchingUserCalendarData"; // Importing the new method
import { coordinatesFromRoomLocation } from "@/app/utils/directions";
import { useTranslation } from "react-i18next";

interface NextClassModalProps {
  visible: boolean;
  onClose: () => void;
  destination: LocationType;
  setDestination: React.Dispatch<React.SetStateAction<LocationType>>;
  testID: string; 
}

const NextClassModal: React.FC<NextClassModalProps> = ({
  visible,
  onClose,
  destination,
  setDestination,
  testID,
}) => {

  const {t} = useTranslation("NextClassModal");

  const [nextClass, setNextClass] = useState<GoogleCalendarEvent | null>(null);
  const [location, setLocation] = useState<RoomLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNextClass = async () => {
      if (!visible) return;

      setIsLoading(true);
      try {
        const events = await fetchTodaysEventsFromSelectedSchedule(); 
        
        if (events.length === 0) {
          setNextClass(null);
          setIsLoading(false);
          return;
        }

        const nextEvent = events[0]; 
        setNextClass(nextEvent);

        const parsedLocation: RoomLocation = nextEvent.location
          ? JSON.parse(nextEvent.location)
          : null;

        if (parsedLocation?.building && typeof parsedLocation.building === 'string') {
          const buildingName = parsedLocation.building;
          const building = [...SGWBuildings, ...LoyolaBuildings].find(
            (b) => b.name === buildingName
          );
          if (building) {
            parsedLocation.building = building;  
          } else {
            parsedLocation.building = SGWBuildings[0]; 
          }
        }

        setLocation(parsedLocation);

      } catch (error) {
        console.error("Error fetching today's events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextClass();
  }, [visible]);

  const handleGetDirections = () => {
    if (!location) return;

    const coordinates = coordinatesFromRoomLocation(
      location,
      SGWBuildings,
      LoyolaBuildings
    );

    if (!coordinates) return;

    setDestination({
      coordinates: coordinates,
      room: location,
      building: location.building,
      campus: location.campus  ?? "SGW",
    } as LocationType);
    onClose();
  };

  const isButtonDisabled =
    !location || !coordinatesFromRoomLocation(location, SGWBuildings, LoyolaBuildings);

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      testID={`${testID}-modal`}
    >
      <View style={styles.overlay} testID={`${testID}-overlay`}>
        <View style={styles.modalContainer} testID={`${testID}-modal-container`}>
          <Text style={styles.title} testID={`${testID}-modal-title`}>
            {t("Next Class")}
          </Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#912338"
              testID={`${testID}-loading-indicator`}
            />
          ) : nextClass ? (
            <>
              <Text style={styles.className} testID={`${testID}-class-name`}>
                {nextClass.summary}
              </Text>
              <Text style={styles.time} testID={`${testID}-class-time`}>
                {new Date(nextClass.start.dateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(nextClass.end.dateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>

              <View style={styles.infoContainer} testID={`${testID}-room-info`}>
                <Text style={styles.label} testID={`${testID}-room-label`}>
                  {t("Room")}:
                </Text>
                <Text style={styles.value} testID={`${testID}-room-value`}>
                  {location?.room?.toUpperCase() || "N/A"}
                </Text>
              </View>
              <View style={styles.infoContainer} testID={`${testID}-building-info`}>
                <Text style={styles.label} testID={`${testID}-building-label`}>
                  {t("Building")}:
                </Text>
                <Text style={styles.value} testID={`${testID}-building-value`}>
                  {location?.building?.name || "N/A"}
                </Text>
              </View>
              <View style={styles.infoContainer} testID={`${testID}-campus-info`}>
                <Text style={styles.label} testID={`${testID}-campus-label`}>
                  {t("Campus")}:
                </Text>
                <Text style={styles.value} testID={`${testID}-campus-value`}>
                  {location?.campus || t("Unknown")}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, isButtonDisabled && styles.disabledButton]}
                onPress={handleGetDirections}
                disabled={isButtonDisabled}
                testID={`${testID}-get-directions-button`}
              >
                <Text style={styles.buttonText} testID={`${testID}-get-directions-text`}>
                  {isButtonDisabled ? t("Location Not Available") : t("Go to Location")}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noClassText} testID={`${testID}-no-class-text`}>
              {t("No upcoming classes found.")}
            </Text>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            testID={`${testID}-close-button`}
          >
            <Text style={styles.closeButtonText} testID={`${testID}-close-button-text`}>
              {t("Close")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#912338",
    marginBottom: 15,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  time: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#912338",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  noClassText: {
    fontSize: 16,
    color: "gray",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#912338",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 15,
  },
  closeButtonText: {
    color: "#912338",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NextClassModal;
