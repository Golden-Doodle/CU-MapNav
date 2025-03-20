import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DirectionsModal from '../DirectionsModal';
import { generateDirections } from '../../../services/Mapped-In/MappedInService';

jest.mock('../../../services/Mapped-In/MappedInService', () => ({
  generateDirections: jest.fn(),
}));

const defaultVenueData = {
  locations: [
    { name: 'Room1', toMap: 'map1', nodes: [] },
    { name: 'Room2', toMap: 'map2', nodes: [] },
  ],
};

const createFakeMapView = (customVenueData = defaultVenueData) => ({
  current: {
    venueData: customVenueData,
    setMap: jest.fn(),
  },
});

type RenderModalProps = {
  visible?: boolean;
  onRequestClose?: () => void;
  onDirectionsSet?: (directions: any) => void;
  mapView: any;
};

const renderDirectionsModal = ({
  visible = true,
  onRequestClose = jest.fn(),
  onDirectionsSet = jest.fn(),
  mapView,
}: RenderModalProps) => {
  return render(
    <DirectionsModal
      visible={visible}
      onRequestClose={onRequestClose}
      mapView={mapView}
      onDirectionsSet={onDirectionsSet}
    />
  );
};

describe('DirectionsModal', () => {
  let fakeMapView: ReturnType<typeof createFakeMapView>;

  beforeEach(() => {
    fakeMapView = createFakeMapView();
    (generateDirections as jest.Mock).mockReset();
  });

  it('renders the modal correctly when visible', () => {
    const { getByText } = renderDirectionsModal({ mapView: fakeMapView });
    expect(getByText('Select Rooms')).toBeTruthy();
    expect(getByText('Start Room:')).toBeTruthy();
    expect(getByText('Destination Room:')).toBeTruthy();
  });

  it('shows alert if start or destination room is not selected', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = renderDirectionsModal({ mapView: fakeMapView });
    fireEvent.press(getByText('Get Directions'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Select Room',
      'Please select both a start and destination room.'
    );
    alertSpy.mockRestore();
  });

  it('calls getDirections and updates map when valid rooms are selected with departure.toMap', async () => {
    (generateDirections as jest.Mock).mockReturnValue({ route: 'fake-route' });
    const onDirectionsSetMock = jest.fn();
    const onRequestCloseMock = jest.fn();
    const { getByText, getByTestId } = renderDirectionsModal({
      mapView: fakeMapView,
      onDirectionsSet: onDirectionsSetMock,
      onRequestClose: onRequestCloseMock,
    });
    fireEvent(getByTestId('startPicker'), 'onValueChange', 'Room1');
    fireEvent(getByTestId('destinationPicker'), 'onValueChange', 'Room2');
    fireEvent.press(getByText('Get Directions'));
    expect(generateDirections).toHaveBeenCalledWith(fakeMapView, 'Room1', 'Room2');
    expect(fakeMapView.current.setMap).toHaveBeenCalledWith('map1');
    await waitFor(() => {
      expect(onDirectionsSetMock).toHaveBeenCalledWith({ route: 'fake-route' });
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
    (generateDirections as jest.Mock).mockReturnValue({ route: 'fake-route' });
    const onDirectionsSetMock = jest.fn();
    const onRequestCloseMock = jest.fn();
    const { getByText, getByTestId } = renderDirectionsModal({
      mapView: fakeMapView,
      onDirectionsSet: onDirectionsSetMock,
      onRequestClose: onRequestCloseMock,
    });
    fireEvent(getByTestId('startPicker'), 'onValueChange', 'Room1');
    fireEvent(getByTestId('destinationPicker'), 'onValueChange', 'Room2');
    fireEvent.press(getByText('Get Directions'));
    expect(generateDirections).toHaveBeenCalledWith(fakeMapView, 'Room1', 'Room2');
    expect(fakeMapView.current.setMap).toHaveBeenCalledWith('nodeMap1');
    await waitFor(() => {
      expect(onDirectionsSetMock).toHaveBeenCalledWith({ route: 'fake-route' });
      expect(onRequestCloseMock).toHaveBeenCalled();
    });
  });

  it('shows alert when generateDirections returns null', async () => {
    (generateDirections as jest.Mock).mockReturnValue(null);
    const alertSpy = jest.spyOn(Alert, 'alert');
    const onDirectionsSetMock = jest.fn();
    const onRequestCloseMock = jest.fn();
    const { getByText, getByTestId } = renderDirectionsModal({
      mapView: fakeMapView,
      onDirectionsSet: onDirectionsSetMock,
      onRequestClose: onRequestCloseMock,
    });
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
    const { getByText } = renderDirectionsModal({
      mapView: fakeMapView,
      onRequestClose: onRequestCloseMock,
    });
    fireEvent.press(getByText('Close'));
    expect(onRequestCloseMock).toHaveBeenCalled();
  });
});