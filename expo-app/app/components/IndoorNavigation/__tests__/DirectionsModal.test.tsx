import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DirectionsModal from '../DirectionsModal';
import { generateDirections } from '../../../services/Mapped-In/MappedInService';
import { MapViewStore } from '@mappedin/react-native-sdk';

jest.mock('../../../services/Mapped-In/MappedInService', () => ({
  generateDirections: jest.fn(),
}));

jest.mock('../SearchablePicker', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => {
    const handlePress = () => {
      if (props.placeholder === 'Select a start room') {
        props.onValueChange(props.items[0].value);
      } else if (props.placeholder === 'Select a destination room') {
        props.onValueChange(
          props.items.length > 1 ? props.items[1].value : props.items[0].value
        );
      }
    };
    return (
      <TouchableOpacity testID={props.placeholder} onPress={handlePress}>
        <Text>{props.selectedValue || props.placeholder}</Text>
      </TouchableOpacity>
    );
  };
});

describe('DirectionsModal', () => {
  const dummyDirections = { direction: 'dummy' };
  const onRequestClose = jest.fn();
  const onDirectionsSet = jest.fn();
  const mapView = {
    current: {
      venueData: {
        locations: [
          { name: 'RoomA', toMap: 'map1' },
          { name: 'RoomB', toMap: 'map2' },
        ],
      },
      setMap: jest.fn(),
    },
  } as unknown as React.RefObject<MapViewStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    (generateDirections as jest.Mock).mockReset();
  });

  test('renders modal when visible', () => {
    const { getByText } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestClose}
        mapView={mapView}
        onDirectionsSet={onDirectionsSet}
      />
    );
    expect(getByText('Select Rooms')).toBeTruthy();
    expect(getByText('Start Room:')).toBeTruthy();
    expect(getByText('Destination Room:')).toBeTruthy();
    expect(getByText('Get Directions')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
  });

  test('alerts when start or destination room is not selected', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestClose}
        mapView={mapView}
        onDirectionsSet={onDirectionsSet}
      />
    );
    fireEvent.press(getByText('Get Directions'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Select Room',
      'Please select both a start and destination room.'
    );
  });

  test('calls getDirections successfully when both rooms are selected (toMap branch)', async () => {
    (generateDirections as jest.Mock).mockReturnValue(dummyDirections);
    const { getByText, getByTestId } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestClose}
        mapView={mapView}
        onDirectionsSet={onDirectionsSet}
      />
    );
    fireEvent.press(getByTestId('Select a start room'));
    fireEvent.press(getByTestId('Select a destination room'));
    fireEvent.press(getByText('Get Directions'));
    await waitFor(() => {
      expect(generateDirections).toHaveBeenCalledWith(mapView, 'RoomA', 'RoomB');
      expect(mapView.current!.setMap).toHaveBeenCalledWith('map1');
      expect(onDirectionsSet).toHaveBeenCalledWith(dummyDirections);
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  test('calls getDirections successfully when departure has nodes (no toMap branch)', async () => {
    const mapViewNodes = {
      current: {
        venueData: {
          locations: [
            { name: 'RoomA', nodes: [{ map: { id: 'nodeMap' } }] },
            { name: 'RoomB', toMap: 'map2' },
          ],
        },
        setMap: jest.fn(),
      },
    } as unknown as React.RefObject<MapViewStore>;
    (generateDirections as jest.Mock).mockReturnValue(dummyDirections);
    const { getByText, getByTestId } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestClose}
        mapView={mapViewNodes}
        onDirectionsSet={onDirectionsSet}
      />
    );
    fireEvent.press(getByTestId('Select a start room'));
    fireEvent.press(getByTestId('Select a destination room')); 
    fireEvent.press(getByText('Get Directions'));
    await waitFor(() => {
      expect(generateDirections).toHaveBeenCalledWith(mapViewNodes, 'RoomA', 'RoomB');
      expect(mapViewNodes.current!.setMap).toHaveBeenCalledWith('nodeMap');
      expect(onDirectionsSet).toHaveBeenCalledWith(dummyDirections);
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  test('alerts when directions unavailable', async () => {
    (generateDirections as jest.Mock).mockReturnValue(null);
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText, getByTestId } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestClose}
        mapView={mapView}
        onDirectionsSet={onDirectionsSet}
      />
    );
    fireEvent.press(getByTestId('Select a start room'));
    fireEvent.press(getByTestId('Select a destination room'));
    fireEvent.press(getByText('Get Directions'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Directions Unavailable',
        'No directions found between these locations.'
      );
    });
  });

  test('calls onRequestClose when Close button is pressed', async () => {
    const { getByText } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestClose}
        mapView={mapView}
        onDirectionsSet={onDirectionsSet}
      />
    );
    fireEvent.press(getByText('Close'));
    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  test('calls onRequestClose when backdrop is pressed', async () => {
    const { getByTestId } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestClose}
        mapView={mapView}
        onDirectionsSet={onDirectionsSet}
      />
    );
    const backdrop = getByTestId('backdrop');
    fireEvent.press(backdrop);
    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  test('calls onRequestClose when Modal onRequestClose is triggered', async () => {
    const { getByTestId } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestClose}
        mapView={mapView}
        onDirectionsSet={onDirectionsSet}
      />
    );
    const modal = getByTestId('modal');
    modal.props.onRequestClose();
    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });
});