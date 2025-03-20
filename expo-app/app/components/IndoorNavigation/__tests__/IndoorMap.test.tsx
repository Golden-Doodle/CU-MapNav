import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import IndoorMap from '../IndoorMap';

export let mockTriggerDirections: ((onDirectionsSet: (d: any) => void) => void) | undefined;
export let mockTriggerBuildingChange: ((onChangeBuilding: (v: any) => void) => void) | undefined;

jest.mock('@mappedin/react-native-sdk', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    MiMapView: (props: any) => <View testID="miMapView" {...props} />,
    MappedinMap: jest.fn(),
    MappedinDirections: jest.fn(),
    TMappedinDirective: jest.fn(),
    MapViewStore: jest.fn(),
  };
});

jest.mock('@/app/components/IndoorNavigation/DirectionsModal', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return (props: any) => {
    const { visible, onDirectionsSet } = props;
    return visible ? (
      <View testID="directionsModal">
        <Text>DirectionsModal</Text>
        <TouchableOpacity
          testID="triggerDirectionsButton"
          onPress={() => mockTriggerDirections?.(onDirectionsSet)}
        >
          <Text>Trigger Directions</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  };
});

jest.mock('@/app/components/IndoorNavigation/SetBuildingFloorModal', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return (props: any) => {
    const { visible, onChangeBuilding } = props;
    return visible ? (
      <View testID="buildingFloorModal">
        <Text>BuildingFloorModal</Text>
        <TouchableOpacity
          testID="triggerBuildingChangeButton"
          onPress={() => mockTriggerBuildingChange?.(onChangeBuilding)}
        >
          <Text>Trigger Building Change</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  };
});

describe('IndoorMap Component', () => {
  beforeEach(() => {
    mockTriggerDirections = undefined;
    mockTriggerBuildingChange = undefined;
    jest.spyOn(Alert, 'alert').mockClear();
  });

  const setup = () => render(<IndoorMap />);

  const triggerDirectionsModal = async (getByTestId: any, directions: any) => {
    mockTriggerDirections = (onDirectionsSet) => onDirectionsSet(directions);
    fireEvent.press(getByTestId('directionsButton'));
    await waitFor(() => expect(getByTestId('directionsModal')).toBeTruthy());
    fireEvent.press(getByTestId('triggerDirectionsButton'));
  };

  const validDirections = {
    instructions: [{ instruction: 'Test Instruction' }],
    distance: 100,
    path: [1, 2, 3],
  };

  it('renders the indoor map container and content', () => {
    const { getByTestId } = setup();
    expect(getByTestId('indoorMapContainer')).toBeTruthy();
    expect(getByTestId('indoorMapContent')).toBeTruthy();
    expect(getByTestId('mapContainer')).toBeTruthy();
  });

  it('shows the loader overlay when the map is loading', () => {
    const { getByTestId } = setup();
    expect(getByTestId('loaderContainer')).toBeTruthy();
  });

  it('opens the BuildingFloorModal and handles building change', async () => {
    mockTriggerBuildingChange = (onChangeBuilding) => onChangeBuilding('new-building-id');

    const { getByTestId, queryByTestId } = setup();
    fireEvent.press(getByTestId('settingsButton'));
    await waitFor(() => expect(getByTestId('buildingFloorModal')).toBeTruthy());

    fireEvent.press(getByTestId('triggerBuildingChangeButton'));
    await waitFor(() => expect(getByTestId('loaderContainer')).toBeTruthy());
  });

  it('opens DirectionsModal and sets valid directions', async () => {
    const { getByTestId } = setup();
    await triggerDirectionsModal(getByTestId, validDirections);
    await waitFor(() => expect(getByTestId('directionsOverlay')).toBeTruthy());
  });

  it('shows an alert for invalid directions', async () => {
    const invalidDirections = { instructions: [], distance: 0, path: [] };

    const { getByTestId, queryByTestId } = setup();
    await triggerDirectionsModal(getByTestId, invalidDirections);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Directions Unavailable', 'No valid paths found.');
      expect(queryByTestId('directionsOverlay')).toBeNull();
    });
  });

  it('toggles directions overlay and cancels directions', async () => {
    const { getByTestId, queryByTestId } = setup();
    await triggerDirectionsModal(getByTestId, validDirections);

    await waitFor(() => expect(getByTestId('directionsOverlay')).toBeTruthy());

    fireEvent.press(getByTestId('cancelDirectionsButton'));
    await waitFor(() => expect(queryByTestId('directionsOverlay')).toBeNull());
  });

  it('toggles showDirections state to display minimize button', async () => {
    const { getByTestId } = setup();
    await triggerDirectionsModal(getByTestId, validDirections);

    await waitFor(() => expect(getByTestId('directionsOverlay')).toBeTruthy());

    fireEvent.press(getByTestId('showDirectionsButton'));
    await waitFor(() => {
      expect(getByTestId('directionsContainer')).toBeTruthy();
      expect(getByTestId('minimizeButton')).toBeTruthy();
    });
  });
});
