import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { Building, Coordinates, LocationType, RoomLocation } from '@/app/utils/types';
import { getMappedInVenueId } from '@/app/services/NavigationBridge/BuildingEntranceService';
import useLocationDisplay from '@/app/hooks/useLocationDisplay';

interface IndoorNavigationBridgeProps {
    visible: boolean;
    onClose: () => void;
    building: Building;
    destinationRoom?: RoomLocation;
    userLocation: Coordinates | null;
    onExitBuilding: (exit: LocationType) => void;
    onContinueIndoors: () => void;
}

const IndoorNavigationBridge: React.FC<IndoorNavigationBridgeProps> = ({
    visible,
    onClose,
    building,
    destinationRoom,
    userLocation,
    onExitBuilding,
    onContinueIndoors,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation('CampusMap');

    const buildingNameDisplay = building ? building.name : 'Unknown Building';
    const roomDisplay = destinationRoom ? `Room ${destinationRoom.room}` : 'Building Entrance';

    // Find the closest building exit to continue outdoor navigation
    const handleExitBuilding = () => {
        setIsLoading(true);

        // Simulate calculating exit path (would be done with actual indoor routing in production)
        setTimeout(() => {
            // Create a location object for the building exit
            const exitLocation: LocationType = {
                coordinates: building.coordinates[0], // Use first coordinate as exit point for demo
                building: building,
            };

            onExitBuilding(exitLocation);
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            testID="indoor-navigation-bridge-modal"
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>{t('Indoor Navigation')}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buildingInfoContainer}>
                        <View style={styles.infoRow}>
                            <Icon name="location-on" size={24} color="#912338" />
                            <Text style={styles.buildingText}>{buildingNameDisplay}</Text>
                        </View>
                        {destinationRoom && (
                            <View style={styles.infoRow}>
                                <Icon name="meeting-room" size={24} color="#912338" />
                                <Text style={styles.roomText}>{roomDisplay}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.messageContainer}>
                        <Text style={styles.messageText}>
                            {destinationRoom
                                ? t(`You're navigating to ${roomDisplay} in ${buildingNameDisplay}`)
                                : t(`You're navigating inside ${buildingNameDisplay}`)}
                        </Text>
                        <Text style={styles.subtitleText}>
                            {t('How would you like to proceed?')}
                        </Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#912338" style={styles.loader} />
                    ) : (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={onContinueIndoors}
                            >
                                <Icon name="map" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>
                                    {destinationRoom
                                        ? t('Continue to Indoor Navigation')
                                        : t('Explore Inside Building')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={handleExitBuilding}
                            >
                                <Icon name="exit-to-app" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>{t('Exit to Outdoor Navigation')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#912338',
    },
    closeButton: {
        padding: 5,
    },
    buildingInfoContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    buildingText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    roomText: {
        fontSize: 16,
        marginLeft: 10,
    },
    messageContainer: {
        marginBottom: 20,
    },
    messageText: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    actionButtons: {
        flexDirection: 'column',
        gap: 10,
    },
    button: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#912338',
    },
    secondaryButton: {
        backgroundColor: '#666',
    },
    buttonIcon: {
        marginRight: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loader: {
        marginVertical: 20,
    },
});

export default IndoorNavigationBridge;