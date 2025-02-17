import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import {
  Coordinates,
  GoogleCalendarEvent,
  RoomLocation,
  Building,
} from "@/app/utils/types";
import { SGWBuildings, LoyolaBuildings } from "../data/buildingData";
import { fetchCalendarEvents } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";

interface NextClassModalProps {
  visible: boolean;
  onClose: () => void;
  fetchRouteWithDestination: (coordinates: Coordinates) => void;
  buildingData: Building[];
}

const NextClassModal: React.FC<NextClassModalProps> = ({
  visible,
  onClose,
  fetchRouteWithDestination,
}) => {
  const [nextClass, setNextClass] = React.useState<GoogleCalendarEvent | null>(
    null
  );
  const [location, setLocation] = React.useState<RoomLocation | null>(null);

  React.useEffect(() => {

    // Fetch the next class
    const fetchNextClass = async () => {
      if (visible) {
        const events = await fetchCalendarEvents();
        setNextClass(events[0]);

        // Set the location of the next class
        const nextClassLocation = JSON.parse(events[0].location || "{}");

        setLocation(nextClassLocation);
        // console.log("Next Classssd:", nextClassLocation);
      };
    };

    fetchNextClass();
  }, [visible]);

  const handleGetDirections = () => {
    if (!location) {
      return;
    }

    const coordinates: Coordinates | undefined =
      location.campus === "SGW"
        ? SGWBuildings.find((building) => building.name === location.building)
            ?.coordinates[0]
        : LoyolaBuildings.find(
            (building) => building.name === location.building
          )?.coordinates[0];

    if (!coordinates) {
      console.error("Building coordinates not found");
      return;
    }

    fetchRouteWithDestination(coordinates);
    onClose();
  };

  if (!nextClass) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Next Class</Text>
          <Text style={styles.classText}>{nextClass.summary}</Text>
          <Text style={styles.timeText}>
            {new Date(nextClass.start.dateTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            -
            {new Date(nextClass.end.dateTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={styles.roomText}>Room: {location?.room}</Text>
          <Text style={styles.buildingText}>
            Building: {location?.building}
          </Text>
          <Text style={styles.campusText}>
            Campus: {location?.campus || "Unknown"}
          </Text>
          <Button title="Get Directions" onPress={handleGetDirections} />
          <Button color="red" title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  classText: {
    marginBottom: 10,
    textAlign: "center",
    fontSize: 18,
  },
  timeText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  roomText: {
    marginBottom: 5,
    textAlign: "center",
  },
  buildingText: {
    marginBottom: 5,
    textAlign: "center",
  },
  campusText: {
    marginBottom: 20,
    textAlign: "center",
  },
  closeModalButton: {
    color: "red",
  },
});

export default NextClassModal;
