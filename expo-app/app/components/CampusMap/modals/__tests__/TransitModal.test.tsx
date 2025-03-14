import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import TransitModal from '../TransitModal';
import { fetchAllRoutes } from '@/app/utils/directions';
import { LocationType, RouteOption, TransportMode, Building, Coordinates, CustomMarkerType } from '@/app/utils/types';

jest.mock('@/app/utils/directions', () => ({
  fetchAllRoutes: jest.fn(),
}));

describe('TransitModal', () => {
  const mockOnClose = jest.fn();
  const mockSetOrigin = jest.fn();
  const mockSetDestination = jest.fn();
  const mockSetRouteCoordinates = jest.fn();

  const origin: LocationType = { coordinates: { latitude: 45.4215, longitude: -75.6992 } };
  const destination: LocationType = { coordinates: { latitude: 45.4275, longitude: -75.6933 } };

  const mockBuildingData: Building[] = [
    {
      id: "1",
      name: "Building A",
      coordinates: [{ latitude: 45.423, longitude: -75.699 }],
      fillColor: "#FF0000", 
      strokeColor: "#000000", 
      campus: "SGW",
    },
    {
      id: "2",
      name: "Building B",
      coordinates: [{ latitude: 45.424, longitude: -75.700 }],
      fillColor: "#00FF00",
      strokeColor: "#000000",
      campus: "LOY",
    },
  ];
  
  const mockMarkerData: CustomMarkerType[] = [
    { id: '1', title: 'Marker 1', coordinate: { latitude: 45.423, longitude: -75.699 }, campus: "SGW" },
    { id: '2', title: 'Marker 2', coordinate: { latitude: 45.424, longitude: -75.700 }, campus: "LOY" },
  ];

  const mockUserLocation: Coordinates = { latitude: 45.4215, longitude: -75.6992 };

  const routeOptions: RouteOption[] = [
    {
      id: '1',
      mode: 'driving' as TransportMode,
      duration: '30 min',
      durationValue: 1800,
      distance: '2.5 km',
      steps: ['Head north', 'Turn right at the light'],
      routeCoordinates: [{ latitude: 45.4215, longitude: -75.6992 }],
      cost: '$5',
      transport: 'Car',
    }
  ];

  beforeEach(() => {
    (fetchAllRoutes as jest.Mock).mockResolvedValue(routeOptions);
    jest.clearAllMocks();
  });

  const renderModal = (props = {}) => {
    return render(
      <TransitModal
        visible={true}
        onClose={mockOnClose}
        origin={origin}
        destination={destination}
        setOrigin={mockSetOrigin}
        setDestination={mockSetDestination}
        setRouteCoordinates={mockSetRouteCoordinates}
        buildingData={mockBuildingData}
        markerData={mockMarkerData}
        userLocation={mockUserLocation}
        testID="transit-modal"
        {...props}
      />
    );
  };

  it('renders modal and inputs correctly', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByTestId('transit-modal-origin-input').props.value).toBe('45.4215, -75.6992');
      expect(screen.getByTestId('transit-modal-destination-input').props.value).toBe('45.4275, -75.6933');
    });
  });

  it('hides modal when not visible', async () => {
    renderModal({ visible: false });
    await waitFor(() => {
      expect(screen.queryByTestId('transit-modal-container')).toBeNull();
    });
  });

  it('fetches and displays route options', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByTestId('transit-modal-route-transport-1')).toHaveTextContent('Transport: Car');
    });
  });

  it('switches origin and destination', async () => {
    renderModal();
    await act(async () => {
      fireEvent.press(screen.getByTestId('transit-modal-switch-button'));
    });
    expect(mockSetOrigin).toHaveBeenCalledWith(destination);
    expect(mockSetDestination).toHaveBeenCalledWith(origin);
  });

  it('closes modal on close button press', async () => {
    renderModal();
    await act(async () => {
      fireEvent.press(screen.getByTestId('transit-modal-close-button'));
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('sets route coordinates and closes modal when selecting a route', async () => {
    renderModal();
    await waitFor(() => expect(screen.getByTestId('transit-modal-route-option-1')).toBeTruthy());
    await act(async () => {
      fireEvent.press(screen.getByTestId('transit-modal-route-option-1'));
    });
    expect(mockSetRouteCoordinates).toHaveBeenCalledWith(routeOptions[0].routeCoordinates);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles route fetching failure gracefully', async () => {
    (fetchAllRoutes as jest.Mock).mockRejectedValue(new Error('Failed to fetch routes'));
    renderModal();
    await waitFor(() => {
      expect(screen.queryByTestId('transit-modal-route-card-1')).toBeNull();
    });
  });

  it('updates search state when inputs are focused', async () => {
    renderModal();
    await act(async () => {
      fireEvent(screen.getByTestId('transit-modal-origin-input'), 'focus');
    });
    expect(screen.getByTestId('transit-modal-search-result-list')).toBeTruthy();
  });

  it('resets search state when input is cleared', async () => {
    renderModal();
    await act(async () => {
      fireEvent.changeText(screen.getByTestId('transit-modal-origin-input'), '');
      fireEvent(screen.getByTestId('transit-modal-origin-input'), 'submitEditing');
    });
    expect(screen.queryByTestId('transit-modal-search-result-list')).toBeNull();
  });

  it('sets origin to current location when "Use Current Location" is selected', async () => {
    renderModal();
  
    await act(async () => {
      fireEvent(screen.getByTestId('transit-modal-origin-input'), 'focus');
    });
  
    await waitFor(() => {
      expect(screen.getByTestId('transit-modal-use-current-location')).toBeTruthy();
    });
  
    await act(async () => {
      fireEvent.press(screen.getByTestId('transit-modal-use-current-location'));
    });
  
    expect(mockSetOrigin).toHaveBeenCalledWith({
      coordinates: mockUserLocation,
      userLocation: true,
    });
  
    expect(screen.queryByTestId('transit-modal-search-result-list')).toBeNull();
  });
  

  it('sets destination when selecting a search result', async () => {
    renderModal();
    await act(async () => {
      fireEvent(screen.getByTestId('transit-modal-destination-input'), 'focus');
      fireEvent.changeText(screen.getByTestId('transit-modal-destination-input'), 'Building B');
    });
    await waitFor(() => expect(screen.getByTestId('transit-modal-search-result-2')).toBeTruthy());
    await act(async () => {
      fireEvent.press(screen.getByTestId('transit-modal-search-result-2'));
    });
    expect(mockSetDestination).toHaveBeenCalledWith({
      coordinates: mockBuildingData[1].coordinates[0],
      building: mockBuildingData[1],
      campus: mockBuildingData[1].campus,
      selectedBuilding: true,
    });
    expect(screen.queryByTestId('transit-modal-search-result-list')).toBeNull();
  });
});