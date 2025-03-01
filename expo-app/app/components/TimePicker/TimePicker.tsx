import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome5 } from "@expo/vector-icons";

interface TimePickerProps {
    selectedTime: Date;
    setSelectedTime: (time: Date) => void;
    testID?: string; 
}

export default function TimePicker({ selectedTime, setSelectedTime, testID }: TimePickerProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [tempTime, setTempTime] = useState<Date>(selectedTime);

    const handleTimeChange = (_event: any, newTime?: Date) => {
        if (newTime) {
            setTempTime(newTime);
        }
    };

    const confirmTimeSelection = () => {
        setSelectedTime(tempTime);
        setShowPicker(false);
    };

    return (
        <View style={styles.container} testID={testID}>
            <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowPicker(true)}
                testID={`${testID}-time-button`}
            >
                <FontAwesome5 name="clock" size={18} color="#990000" />
                <Text style={styles.timeText} testID={`${testID}-selected-time-text`}>
                    {selectedTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <Modal transparent animationType="fade" testID={`${testID}-time-picker-modal`}>
                    <View style={styles.overlay} testID={`${testID}-modal-overlay`}>
                        <View style={styles.modalContainer} testID={`${testID}-modal-container`}>
                            <DateTimePicker
                                value={tempTime}
                                mode="time"
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                textColor="#000"
                                onChange={handleTimeChange}
                                testID={`${testID}-date-time-picker`}
                            />
                            <TouchableOpacity
                                style={styles.doneButton}
                                onPress={confirmTimeSelection}
                                testID={`${testID}-confirm-button`}
                            >
                                <Text style={styles.doneButtonText} testID={`${testID}-done-button-text`}>
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginBottom: 10,
    },
    timeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#990000",
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    timeText: {
        fontSize: 16,
        marginLeft: 10,
        fontWeight: "500",
        color: "#990000",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 10,
        width: 300,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    doneButton: {
        marginTop: 10,
        backgroundColor: "#990000",
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    doneButtonText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "bold",
    },
});