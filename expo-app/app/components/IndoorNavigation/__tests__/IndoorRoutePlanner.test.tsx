import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import IndoorRoutePlanner from '../IndoorRoutePlanner';
import { Alert } from 'react-native';

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Picker = ({
    selectedValue,
    onValueChange,
    children,
    testID,
  }: {
    selectedValue: any;
    onValueChange: (value: any) => void;
    children: React.ReactNode;
    testID: string;
  }) => (
    <View testID={testID}>
      {React.Children.map(children, (child: React.ReactElement<any>) =>
        React.cloneElement(child, {
          onSelect: () => onValueChange(child.props.value),
        })
      )}
    </View>
  );
  Picker.Item = ({ label, value }: { label: string; value: string }) => (
    <Text>
      {label}: {value}
    </Text>
  );
  return { Picker };
});

jest.mock('../../../services/Mapped-In/MappedInService', () => ({
  fetchRoomItems: jest.fn(),
  generateDirections: jest.fn(),
  clearDirections: jest.fn(),
}));

import {
  fetchRoomItems,
  generateDirections,
  clearDirections,
} from '../../../services/Mapped-In/MappedInService';

const dummyMapView = ({
  current: { venueData: {} },
} as unknown) as React.RefObject<any>;

const roomItemsMock = [
  { label: 'Room A', value: 'room-a' },
  { label: 'Room B', value: 'room-b' },
];

const directionsMock = {
  instructions: [
    { instruction: 'Step 1: Go straight' },
    { instruction: 'Step 2: Turn left' },
  ],
};

describe('IndoorRoutePlanner', () => {
  beforeEach(() => {
    (fetchRoomItems as jest.Mock).mockReturnValue(roomItemsMock);
    (generateDirections as jest.Mock).mockClear();
    (clearDirections as jest.Mock).mockClear();
  });

  it('renders correctly with room pickers and buttons', async () => {
    const mockOnRequestClose = jest.fn();
    const { getByTestId, getAllByText } = render(
      <IndoorRoutePlanner mapView={dummyMapView} onRequestClose={mockOnRequestClose} />
    );
    expect(getByTestId('routePlannerModalContent')).toBeTruthy();
    expect(getByTestId('headerText').props.children).toBe('Get Directions');
    expect(getByTestId('startRoomPicker')).toBeTruthy();
    expect(getByTestId('destinationRoomPicker')).toBeTruthy();
    expect(getByTestId('toggleDirectionsButton')).toBeTruthy();
    expect(getByTestId('closeButton')).toBeTruthy();
    expect(getAllByText(/Room A/).length).toBeGreaterThan(0);
    expect(getAllByText(/Room B/).length).toBeGreaterThan(0);
  });

  it('calls generateDirections when toggling directions on and shows the directions list', async () => {
    const mockOnRequestClose = jest.fn();
    (generateDirections as jest.Mock).mockReturnValue(directionsMock);
    const { getByTestId, getByText, queryByTestId } = render(
      <IndoorRoutePlanner mapView={dummyMapView} onRequestClose={mockOnRequestClose} />
    );
    expect(queryByTestId('directionsContainer')).toBeNull();
    fireEvent.press(getByTestId('toggleDirectionsButton'));
    await waitFor(() => {
      expect(getByTestId('directionsContainer')).toBeTruthy();
    });
    expect(getByText('Step 1: Go straight')).toBeTruthy();
    expect(getByText('Step 2: Turn left')).toBeTruthy();
    expect(generateDirections).toHaveBeenCalledWith(
      dummyMapView,
      roomItemsMock[0].value,
      roomItemsMock[0].value
    );
  });

  it('calls clearDirections when toggling directions off', async () => {
    const mockOnRequestClose = jest.fn();
    (generateDirections as jest.Mock).mockReturnValue(directionsMock);
    const { getByTestId, queryByTestId } = render(
      <IndoorRoutePlanner mapView={dummyMapView} onRequestClose={mockOnRequestClose} />
    );
    fireEvent.press(getByTestId('toggleDirectionsButton'));
    await waitFor(() => {
      expect(getByTestId('directionsContainer')).toBeTruthy();
    });
    fireEvent.press(getByTestId('toggleDirectionsButton'));
    await waitFor(() => {
      expect(queryByTestId('directionsContainer')).toBeNull();
    });
    expect(clearDirections).toHaveBeenCalledWith(dummyMapView);
  });

  it('calls onRequestClose when the Close button is pressed', () => {
    const mockOnRequestClose = jest.fn();
    const { getByTestId } = render(
      <IndoorRoutePlanner mapView={dummyMapView} onRequestClose={mockOnRequestClose} />
    );
    fireEvent.press(getByTestId('closeButton'));
    expect(mockOnRequestClose).toHaveBeenCalled();
  });

  it('shows an alert if generateDirections returns null', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const mockOnRequestClose = jest.fn();
    (generateDirections as jest.Mock).mockReturnValue(null);
    const { getByTestId } = render(
      <IndoorRoutePlanner mapView={dummyMapView} onRequestClose={mockOnRequestClose} />
    );
    fireEvent.press(getByTestId('toggleDirectionsButton'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Directions Unavailable',
        'No directions found between these locations or location not found.'
      );
    });
  });
});