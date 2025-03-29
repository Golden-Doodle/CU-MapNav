import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { Building, Coordinates, LocationType, RoomLocation } from '@/app/utils/types';
import { getDirections } from '@/app/utils/directions';
import useLocationDisplay from '@/app/hooks/useLocationDisplay';
import { isPointInPolygon } from '@/app/utils/MapUtils';

interface NavigationBridgeProps {
    visible: boolean;
    onClose: () => void;
    origin: LocationType;
    destination: LocationType;
    currentBuilding: Building | null;
    onContinueIndoors: (building: Building, destinationRoom?: RoomLocation) => void;
    onContinueOutdoors: (origin: LocationType, destination: LocationType) => void;
}

const NavigationBridge: React.FC<NavigationBridgeProps> = ({
    visible,
    onClose,
    origin,
    destination,
    currentBuilding,
    onContinueIndoors,
    onContinueOutdoors,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [stepType, setStepType] = useState<'outdoor' | 'indoor' | 'transition'>('outdoor');
    const [routeSteps, setRouteSteps] = useState<string[]>([]);
    const { t } = useTranslation('CampusMap');

    const originDisplay = useLocationDisplay(origin);
    const destinationDisplay = useLocationDisplay(destination);

    useEffect(() => {
        if (visible) {
            analyzeNavigationScenario();
        }
    }, [visible, origin, destination, currentBuilding]);

    const analyzeNavigationScenario = () => {
        setIsLoading(true);

        // Case 1: User is outside, destination is inside a building
        if (destination?.building && (!currentBuilding || currentBuilding.id !== destination.building.id)) {
            setStepType('transition');
            generateTransitionSteps(false);
        }
        // Case 2: User is inside a building, destination is outside
        else if (currentBuilding && (!destination?.building || currentBuilding.id !== destination.building.id)) {
            setStepType('transition');
            generateTransitionSteps(true);
        }
        // Case 3: User is inside the same building as the destination
        else if (currentBuilding && destination?.building && currentBuilding.id === destination.building.id) {
            setStepType('indoor');
            generateIndoorSteps();
        }
        // Case 4: Regular outdoor navigation
        else {
            setStepType('outdoor');
            generateOutdoorSteps();
        }

        setIsLoading(false);
    };

    const generateTransitionSteps = async (exitingBuilding: boolean) => {
        const steps: string[] = [];

        if (exitingBuilding && currentBuilding) {
            // Indoor to outdoor
            steps.push(`Exit ${currentBuilding.name} through the main entrance`);
            steps.push('Follow outdoor directions to your destination');
        } else if (destination?.building) {
            // Outdoor to indoor
            steps.push('Follow outdoor directions to the building');
            steps.push(`Enter ${destination.building.name} through the main entrance`);

            if (destination.room) {
                steps.push(`Navigate to room ${destination.room.room} inside the building`);
            }
        }

        setRouteSteps(steps);
    };

    const generateIndoorSteps = () => {
        const steps: string[] = [];

        if (currentBuilding && destination?.room) {
            steps.push(`You are currently in ${currentBuilding.name}`);
            steps.push(`Navigate to room ${destination.room.room} inside the building`);
        }

        setRouteSteps(steps);
    };

    const generateOutdoorSteps = async () => {
        if (!origin?.coordinates || !destination?.coordinates) {
            setRouteSteps(['Unable to generate directions: invalid coordinates']);
            return;
        }

        try {
            const route = await getDirections(origin.coordinates, destination.coordinates);

            if (route && route.length > 0) {
                setRouteSteps(['Follow the outdoor route to your destination']);
            } else {
                setRouteSteps(['No route found between these locations']);
            }
        } catch (error) {
            console.error('Error generating outdoor directions:', error);
            setRouteSteps(['Error generating directions']);
        }
    };

    const handleContinueIndoors = () => {
        if (destination?.building) {
            onContinueIndoors(destination.building, destination.room);
        }
        onClose();
    };

    const handleContinueOutdoors = () => {
        onContinueOutdoors(origin, destination);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            testID="navigation-bridge-modal"
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>{t('Navigation Bridge')}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.routeInfoContainer}>
                        <View style={styles.locationItem}>
                            <Icon name="my-location" size={22} color="#912338" />
                            <Text style={styles.locationText}>{originDisplay}</Text>
                        </View>
                        <Icon name="arrow-downward" size={24} color="#666" style={styles.arrow} />
                        <View style={styles.locationItem}>
                            <Icon name="location-on" size={22} color="#912338" />
                            <Text style={styles.locationText}>{destinationDisplay}</Text>
                        </View>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#912338" style={styles.loader} />
                    ) : (
                        <>
                            <View style={styles.routeTypeContainer}>
                                <Text style={styles.routeTypeText}>
                                    {stepType === 'outdoor' ? 'Outdoor Navigation' :
                                        stepType === 'indoor' ? 'Indoor Navigation' :
                                            'Indoor-Outdoor Transition'}
                                </Text>
                            </View>

                            <ScrollView style={styles.stepsContainer}>
                                {routeSteps.map((step, index) => (
                                    <View key={index} style={styles.stepItem}>
                                        <Text style={styles.stepNumber}>{index + 1}</Text>
                                        <Text style={styles.stepText}>{step}</Text>
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={styles.actionButtons}>
                                {stepType === 'transition' && (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.button, styles.primaryButton]}
                                            onPress={handleContinueIndoors}
                                        >
                                            <Text style={styles.buttonText}>{t('Continue Indoors')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, styles.secondaryButton]}
                                            onPress={handleContinueOutdoors}
                                        >
                                            <Text style={styles.buttonText}>{t('Continue Outdoors')}</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                {stepType === 'indoor' && (
                                    <TouchableOpacity
                                        style={[styles.button, styles.primaryButton]}
                                        onPress={handleContinueIndoors}
                                    >
                                        <Text style={styles.buttonText}>{t('Continue to Indoor Map')}</Text>
                                    </TouchableOpacity>
                                )}
                                {stepType === 'outdoor' && (
                                    <TouchableOpacity
                                        style={[styles.button, styles.primaryButton]}
                                        onPress={handleContinueOutdoors}
                                    >
                                        <Text style={styles.buttonText}>{t('Continue to Outdoor Map')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
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
        maxHeight: '80%',
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
    routeInfoContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    locationText: {
        fontSize: 16,
        marginLeft: 10,
        flex: 1,
    },
    arrow: {
        alignSelf: 'center',
        marginVertical: 5,
    },
    routeTypeContainer: {
        backgroundColor: '#912338',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    routeTypeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    stepsContainer: {
        maxHeight: 200,
        marginBottom: 15,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    stepNumber: {
        backgroundColor: '#912338',
        color: 'white',
        width: 25,
        height: 25,
        borderRadius: 12.5,
        textAlign: 'center',
        lineHeight: 25,
        marginRight: 10,
        fontWeight: 'bold',
    },
    stepText: {
        fontSize: 16,
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'column',
        gap: 10,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#912338',
    },
    secondaryButton: {
        backgroundColor: '#666',
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

export default NavigationBridge;