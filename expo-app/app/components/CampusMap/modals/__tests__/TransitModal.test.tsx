import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import TransitModal from '../TransitModal';  
import { fetchAllRoutes } from '@/app/utils/directions';
import { LocationType, RouteOption, TransportMode, Building, Campus, Coordinates, CustomMarkerType } from '@/app/utils/types';

jest.mock('@/app/utils/directions', () => ({
  fetchAllRoutes: jest.fn(),
}));

describe('TransitModal', () => {
  const mockOnClose = jest.fn();
  const mockSetOrigin = jest.fn();
  const mockSetDestination = jest.fn();
  const mockSetRouteCoordinates = jest.fn();

  const origin: LocationType = {
    coordinates: { latitude: 45.4215, longitude: -75.6992 },
  };

  const destination: LocationType = {
    coordinates: { latitude: 45.4275, longitude: -75.6933 }
  };

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
    { id: '1', title: 'Marker 1', description: 'Description 1', coordinate: { latitude: 45.423, longitude: -75.699 }, campus: "SGW" },
    { id: '2', title: 'Marker 2', description: 'Description 2', coordinate: { latitude: 45.424, longitude: -75.700 }, campus: "LOY" }
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
      frequency: '10 min',
      transport: 'Car',
      arrival_time: {
        text: '10:30 AM',
        value: 1625633400,
        time_zone: 'America/Toronto'
      },
      departure_time: {
        text: '10:00 AM',
        value: 1625632800,
        time_zone: 'America/Toronto'
      }
    }
  ];

  beforeEach(() => {
    (fetchAllRoutes as jest.Mock).mockResolvedValue(routeOptions);
  });

  it('renders modal when visible prop is true', async () => {
    const originWithUserLocation: LocationType = {
      userLocation: true, 
      coordinates: { latitude: 45.4215, longitude: -75.6992 },
    };

    render(
      <TransitModal
        visible={true}
        onClose={mockOnClose}
        origin={originWithUserLocation}
        destination={destination}
        setOrigin={mockSetOrigin}
        setDestination={mockSetDestination}
        setRouteCoordinates={mockSetRouteCoordinates}
        buildingData={mockBuildingData} 
        markerData={mockMarkerData}
        userLocation={mockUserLocation}    
        testID="transit-modal"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('transit-modal-origin-input').props.value).toBe('Current Location');
      expect(screen.getByTestId('transit-modal-destination-input').props.value).toBe('45.4275, -75.6933');
    });
  });

  it('hides modal when visible prop is false', async () => {
    render(
      <TransitModal
        visible={false}
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
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Current Location')).toBeNull();
    });
  });

  it('fetches and displays route options', async () => {
    render(
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
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('transit-modal-route-transport-1')).toHaveTextContent('Transport: Car');
      expect(screen.getByTestId('transit-modal-route-cost-1')).toHaveTextContent('Cost: $5');
      expect(screen.getByTestId('transit-modal-route-time-1')).toHaveTextContent('10:00 AM - 10:30 AM');
      expect(screen.getByTestId('transit-modal-route-distance-1')).toHaveTextContent('Distance: 2.5 km');
    });
  });

  it('handles "Switch" button press', async () => {
    const originWithCoordinates: LocationType = {
      coordinates: { latitude: 45.4215, longitude: -75.6992 },
    };
    const destinationWithCoordinates: LocationType = {
      coordinates: { latitude: 45.4275, longitude: -75.6933 }
    };
  
    render(
      <TransitModal
        visible={true}
        onClose={mockOnClose}
        origin={originWithCoordinates}
        destination={destinationWithCoordinates}
        setOrigin={mockSetOrigin}
        setDestination={mockSetDestination}
        setRouteCoordinates={mockSetRouteCoordinates}
        buildingData={mockBuildingData}
        markerData={mockMarkerData}
        userLocation={mockUserLocation}
        testID="transit-modal"
      />
    );
  
    await act(async () => {
      fireEvent.press(screen.getByTestId('transit-modal-switch-button'));
    });
  
    expect(mockSetOrigin).toHaveBeenCalledWith(destinationWithCoordinates);
    expect(mockSetDestination).toHaveBeenCalledWith(originWithCoordinates);
  });

  it('closes modal when close icon is pressed', async () => {
    render(
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
      />
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('transit-modal-close-button'));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('sets route coordinates and closes modal when route is selected', async () => {
    render(
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
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId(`transit-modal-route-option-1`)).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId(`transit-modal-route-option-1`));
    });

    expect(mockSetRouteCoordinates).toHaveBeenCalledWith(routeOptions[0].routeCoordinates);
    expect(mockOnClose).toHaveBeenCalled();
  });
});