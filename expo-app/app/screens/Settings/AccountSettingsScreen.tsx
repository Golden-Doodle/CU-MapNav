import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker"; // <-- Import the Picker
import { AuthContext } from "@/app/contexts/AuthContext";
import { fetchAllCalendars } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";

const MAJORS = [
  "Computer Science",
  "Software Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Psychology",
  "Economics",
  "Marketing",
  "Biology",
];

export default function AccountDetailsScreen() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider.");
  }
  const { user } = authContext;

  // Local Profile State
  const [profile, setProfile] = useState({
    name: "Johnny Woodstorm",
    email: user?.email || "j.wood@live.concordia.ca",
    password: "********",
    major: "Software Engineering", // default
    phone: "514-101-1008",
  });

  // Photo State & Permissions
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(
    user?.photoURL || null
  );

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your photo library to set a profile picture."
        );
      }
    })();
  }, []);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn("Error picking image:", error);
    }
  };

  // Edit Modal Logic
  const [editingField, setEditingField] = useState<keyof typeof profile | "">("");
  const [editedValue, setEditedValue] = useState("");

  const startEditing = (field: keyof typeof profile) => {
    setEditingField(field);
    setEditedValue(profile[field]);
  };

  const saveEdit = () => {
    if (editingField) {
      setProfile((prev) => ({ ...prev, [editingField]: editedValue }));
      setEditingField("");
    }
  };

  // Schedule Selection
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [availableSchedules, setAvailableSchedules] = useState<any[]>([]);
  const [initialCalendarId, setInitialCalendarId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allCalendars = await fetchAllCalendars();
        const storedCalendarId = await AsyncStorage.getItem("selectedScheduleID");
        setAvailableSchedules(allCalendars);
        setSelectedCalendarId(storedCalendarId);
        setInitialCalendarId(storedCalendarId);
      } catch (err) {
        console.error("Error loading schedules:", err);
      }
    };
    loadData();
  }, []);

  const selectCalendar = (calendarId: string) => {
    setSelectedCalendarId(calendarId);
    setHasChanges(calendarId !== initialCalendarId);
  };

  const saveChanges = async () => {
    if (selectedCalendarId) {
      await AsyncStorage.setItem("selectedScheduleID", selectedCalendarId);
      const selCalendar = availableSchedules.find(
        (cal) => cal.id === selectedCalendarId
      );
      if (selCalendar) {
        await AsyncStorage.setItem("selectedScheduleName", selCalendar.summary);
      }
    }
    setInitialCalendarId(selectedCalendarId);
    setHasChanges(false);
    Alert.alert("Success", "Your changes have been saved!");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header} testID="header">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Account Details</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.profileContainer} testID="profile-container">
          {selectedPhotoUri ? (
            <Image source={{ uri: selectedPhotoUri }} style={styles.profileImage} testID="profile-image" />
          ) : (
            <FontAwesome5 name="user-circle" size={100} color="#888" />
          )}
          <TouchableOpacity style={styles.editPhotoButton} onPress={handlePickImage} testID="edit-photo-button">
            <FontAwesome5 name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {Object.entries(profile).map(([fieldKey, fieldValue]) => (
          <View key={fieldKey} style={styles.section} testID={`section-${fieldKey}`}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>
                {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}
              </Text>
              <TouchableOpacity
                onPress={() => startEditing(fieldKey as keyof typeof profile)}
                testID={`edit-${fieldKey}`}
              >
                <FontAwesome5 name="edit" size={18} color="#912238" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: "#F2F3F5" }]}
              value={fieldValue as string}
              editable={false}
              testID={`input-${fieldKey}`}
            />
          </View>
        ))}

        <View style={styles.divider} testID="divider" />

        <Text style={styles.label} testID="schedule-label">Select Schedule</Text>
        {availableSchedules.length > 0 ? (
          availableSchedules.map((calendar) => (
            <View key={calendar.id} style={styles.scheduleOption} testID={`schedule-${calendar.id}`}>
              <Text style={styles.scheduleText}>{calendar.summary}</Text>
              <Switch
                value={selectedCalendarId === calendar.id}
                onValueChange={() => selectCalendar(calendar.id)}
                testID={`switch-${calendar.id}`}
              />
            </View>
          ))
        ) : (
          <Text style={styles.noCalendarText}>No schedules found</Text>
        )}

        <TouchableOpacity
          style={[styles.saveButton, { opacity: hasChanges ? 1 : 0.5 }]}
          activeOpacity={0.8}
          disabled={!hasChanges}
          onPress={saveChanges}
          testID="save-button"
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={editingField !== ""} transparent animationType="slide" testID="modal-container">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit{" "}
              {editingField
                ? editingField.charAt(0).toUpperCase() + editingField.slice(1)
                : ""}
            </Text>

            {editingField === "major" ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editedValue}
                  onValueChange={(itemValue) => setEditedValue(itemValue)}
                  style={styles.majorPicker}
                >
                  {MAJORS.map((m) => (
                    <Picker.Item key={m} label={m} value={m} />
                  ))}
                </Picker>
              </View>
            ) : (
              <TextInput
                style={styles.modalInput}
                value={editedValue}
                onChangeText={setEditedValue}
                testID="modal-input"
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingField("")}
                testID="cancel-button"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButtonModal]}
                onPress={saveEdit}
                testID="save-edit-button"
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ----------------------------
// STYLES
// ----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 10,
    backgroundColor: "#912338",
    padding: 6,
    borderRadius: 15,
  },
  section: {
    width: "100%",
    marginBottom: 15,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F2F3F5",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20,
    width: "100%",
  },
  scheduleOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#F2F2F2",
    width: "100%",
  },
  scheduleText: {
    fontSize: 16,
  },
  noCalendarText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#912338",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    width: "100%",
  },
  saveButtonText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  majorPicker: {
    width: "100%",
    height: 55,
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  saveButtonModal: {
    backgroundColor: "#912238",
  },
  cancelText: {
    color: "#333",
    fontWeight: "bold",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
