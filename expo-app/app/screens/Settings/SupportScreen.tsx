import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

export default function SupportScreen() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome5 name="arrow-left" size={30} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Support</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Need Help?</Text>
                <Text style={styles.infoText}>For assistance, please contact:</Text>
                <Text style={styles.infoText}>support@example.com</Text>

                <View style={styles.divider} />
                <Text style={styles.label}>Frequently Asked Questions</Text>
                <Text style={styles.infoText}>Visit our FAQ section for common questions and answers.</Text>

                <TouchableOpacity style={styles.supportButton} onPress={() => Alert.alert("Report Issue", "Redirecting to issue reporting...") }>
                    <FontAwesome5 name="bug" size={18} color="#fff" />
                    <Text style={styles.supportButtonText}>Report a Problem</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FB",
        paddingHorizontal: 20,
        paddingTop: 20,
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
        fontSize: 30,
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
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#555",
        marginBottom: 8,
        alignSelf: "flex-start",
    },
    infoText: {
        fontSize: 14,
        color: "#444",
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 20,
        width: "100%",
    },
    supportButton: {
        backgroundColor: "#912338",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
    },
    supportButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
    },
});
