import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DirectionsModal from '../DirectionsModal';
import { generateDirections } from '../../../services/Mapped-In/MappedInService';

jest.mock('../../../services/Mapped-In/MappedInService', () => ({
  generateDirections: jest.fn(),
}));

describe('DirectionsModal', () => {
  let fakeMapView: React.RefObject<any>;
  const fakeDirections = { route: 'fake-route' };
  const venueData = {
    locations: [
      { name: 'Room1', toMap: 'map1', nodes: [] },
      { name: 'Room2', toMap: 'map2', nodes: [] },
    ],
  };
  const createFakeMapView = (customVenueData = venueData) => ({
    current: {
      venueData: customVenueData,
      setMap: jest.fn(),
    },
  });

  beforeEach(() => {
    fakeMapView = createFakeMapView();
    (generateDirections as jest.Mock).mockReset();
  });

  it('renders the modal correctly when visible', () => {
    const { getByText } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={jest.fn()}
        mapView={fakeMapView}
        onDirectionsSet={jest.fn()}
      />
    );
    expect(getByText('Select Rooms')).toBeTruthy();
    expect(getByText('Start Room:')).toBeTruthy();
    expect(getByText('Destination Room:')).toBeTruthy();
  });

  it('shows alert if start or destination room is not selected', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={jest.fn()}
        mapView={fakeMapView}
        onDirectionsSet={jest.fn()}
      />
    );
    fireEvent.press(getByText('Get Directions'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Select Room',
      'Please select both a start and destination room.'
    );
    alertSpy.mockRestore();
  });

  it('calls getDirections and updates map when valid rooms are selected with departure.toMap', async () => {
    (generateDirections as jest.Mock).mockReturnValue(fakeDirections);
    const onDirectionsSetMock = jest.fn();
    const onRequestCloseMock = jest.fn();
    const { getByText, getByTestId } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestCloseMock}
        mapView={fakeMapView}
        onDirectionsSet={onDirectionsSetMock}
      />
    );
    fireEvent(getByTestId('startPicker'), 'onValueChange', 'Room1');
    fireEvent(getByTestId('destinationPicker'), 'onValueChange', 'Room2');
    fireEvent.press(getByText('Get Directions'));
    expect(generateDirections).toHaveBeenCalledWith(fakeMapView, 'Room1', 'Room2');
    expect(fakeMapView.current.setMap).toHaveBeenCalledWith('map1');
    await waitFor(() => {
      expect(onDirectionsSetMock).toHaveBeenCalledWith(fakeDirections);
      expect(onRequestCloseMock).toHaveBeenCalled();
    });
  });

  it('calls getDirections and updates map using node.map.id when departure.toMap is absent', async () => {
    const customVenueData: any = {
      locations: [
        { name: 'Room1', toMap: undefined, nodes: [{ map: { id: 'nodeMap1' } }] },
        { name: 'Room2', toMap: 'map2', nodes: [] },
      ],
    };
    fakeMapView = createFakeMapView(customVenueData);
    (generateDirections as jest.Mock).mockReturnValue(fakeDirections);
    const onDirectionsSetMock = jest.fn();
    const onRequestCloseMock = jest.fn();
    const { getByText, getByTestId } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestCloseMock}
        mapView={fakeMapView}
        onDirectionsSet={onDirectionsSetMock}
      />
    );
    fireEvent(getByTestId('startPicker'), 'onValueChange', 'Room1');
    fireEvent(getByTestId('destinationPicker'), 'onValueChange', 'Room2');
    fireEvent.press(getByText('Get Directions'));
    expect(generateDirections).toHaveBeenCalledWith(fakeMapView, 'Room1', 'Room2');
    expect(fakeMapView.current.setMap).toHaveBeenCalledWith('nodeMap1');
    await waitFor(() => {
      expect(onDirectionsSetMock).toHaveBeenCalledWith(fakeDirections);
      expect(onRequestCloseMock).toHaveBeenCalled();
    });
  });

  it('shows alert when generateDirections returns null', async () => {
    (generateDirections as jest.Mock).mockReturnValue(null);
    const alertSpy = jest.spyOn(Alert, 'alert');
    const onDirectionsSetMock = jest.fn();
    const onRequestCloseMock = jest.fn();
    const { getByText, getByTestId } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestCloseMock}
        mapView={fakeMapView}
        onDirectionsSet={onDirectionsSetMock}
      />
    );
    fireEvent(getByTestId('startPicker'), 'onValueChange', 'Room1');
    fireEvent(getByTestId('destinationPicker'), 'onValueChange', 'Room2');
    fireEvent.press(getByText('Get Directions'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Directions Unavailable',
      'No directions found between these locations.'
    );
    alertSpy.mockRestore();
    expect(onDirectionsSetMock).not.toHaveBeenCalled();
    expect(onRequestCloseMock).not.toHaveBeenCalled();
  });

  it('calls onRequestClose when the close button is pressed', () => {
    const onRequestCloseMock = jest.fn();
    const { getByText } = render(
      <DirectionsModal
        visible={true}
        onRequestClose={onRequestCloseMock}
        mapView={fakeMapView}
        onDirectionsSet={jest.fn()}
      />
    );
    fireEvent.press(getByText('Close'));
    expect(onRequestCloseMock).toHaveBeenCalled();
  });
});
