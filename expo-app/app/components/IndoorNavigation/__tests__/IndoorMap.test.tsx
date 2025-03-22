import React, { act } from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import IndoorMap from '../IndoorMap';
import { generateDirections as generateIndoorDirections } from '@/app/services/Mapped-In/MappedInService';

export let mockTriggerDirections: ((onDirectionsSet: (directions: any) => void) => void) | undefined = undefined;
export let mockTriggerBuildingChange: ((onChangeBuilding: (v: any) => void) => void) | undefined = undefined;

let globalMiMapViewRef: { current: any } = { current: null };

type MiMapViewProps = {
  testID?: string;
  ref?: any;
  options?: any;
  onFirstMapLoaded?: () => void;
  onMapChanged?: (event: { map: { id: string } }) => void;
  [key: string]: any;
};

type DirectionsModalProps = {
  visible: boolean;
  onDirectionsSet: (directions: any) => void;
  onRequestClose?: () => void;
  [key: string]: any;
};

type BuildingFloorModalProps = {
  visible: boolean;
  onChangeBuilding: (v: any) => void;
  onRequestClose?: () => void;
  selectedBuilding?: string;
  buildingItems?: Array<{ label: string; value: string }>;
  selectedFloor?: string | null;
  onChangeFloor?: (floor: string | null) => void;
  floorItems?: Array<{ label: string; value: string }>;
  [key: string]: any;
};

jest.mock('@mappedin/react-native-sdk', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MiMapView = React.forwardRef((props: MiMapViewProps, ref: any) => {
    globalMiMapViewRef = ref;
    return <View testID="miMapView" ref={ref} {...props} />;
  });
  return {
    MiMapView,
    MappedinMap: jest.fn(),
    MappedinDirections: jest.fn(),
    TMappedinDirective: jest.fn(),
    MapViewStore: jest.fn(),
  };
});

jest.mock('@/app/components/IndoorNavigation/DirectionsModal', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return (props: DirectionsModalProps) => {
    const { visible, onDirectionsSet } = props;
    return visible ? (
      <View testID="directionsModal">
        <Text>DirectionsModal</Text>
        <TouchableOpacity
          testID="triggerDirectionsButton"
          onPress={() => {
            if (mockTriggerDirections) {
              mockTriggerDirections(onDirectionsSet);
            }
          }}
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
  return (props: BuildingFloorModalProps) => {
    const { visible, onChangeBuilding } = props;
    return visible ? (
      <View testID="buildingFloorModal">
        <Text>BuildingFloorModal</Text>
        <TouchableOpacity
          testID="triggerBuildingChangeButton"
          onPress={() => {
            if (mockTriggerBuildingChange) {
              mockTriggerBuildingChange(onChangeBuilding);
            }
          }}
        >
          <Text>Trigger Building Change</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  };
});

jest.mock('@/app/services/Mapped-In/MappedInService', () => ({
  generateDirections: jest.fn(),
}));

describe('IndoorMap Component', () => {
  beforeEach(() => {
    mockTriggerDirections = undefined;
    mockTriggerBuildingChange = undefined;
    jest.spyOn(Alert, 'alert').mockClear();
  });

  const setup = () => render(<IndoorMap />);

  const triggerDirectionsModal = async (
    getByTestId: (testID: string) => any,
    directions: any
  ) => {
    mockTriggerDirections = (onDirectionsSet: (d: any) => void) => onDirectionsSet(directions);
    fireEvent.press(getByTestId('directionsButton'));
    await waitFor(() => expect(getByTestId('directionsModal')).toBeTruthy());
    fireEvent.press(getByTestId('triggerDirectionsButton'));
  };

  const validDirections = {
    instructions: [{ instruction: 'Test Instruction' }],
    distance: 100,
    path: [{ map: { id: 'floor2' } }],
  };

  const mockBuilding = {
    id: 'hall-id',
    name: 'Hall',
    coordinates: [{ latitude: 0, longitude: 0 }],
    fillColor: 'rgba(0, 0, 255, 1)',
    strokeColor: 'rgba(0, 0, 0, 1)',
    campus: 'SGW' as const,
  };

  const destinationRoom = {
    room: 'H-833',
    building: mockBuilding,
    campus: 'SGW' as const,
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
    mockTriggerBuildingChange = (onChangeBuilding: (v: any) => void) => onChangeBuilding('new-building-id');

    const { getByTestId } = setup();
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

  it('handles destinationRoom with valid directions on first map load', async () => {
    const fakeSetMap = jest.fn().mockResolvedValue(undefined);
    const fakeMapView = {
      currentMap: { id: 'floor1' },
      venueData: { maps: [{ id: 'floor1', name: 'Floor 1' }] },
      setMap: fakeSetMap,
    };
    const validDirectionsForLoad = {
      instructions: [{ instruction: 'Go straight' }],
      distance: 50,
      path: [{ map: { id: 'floor2' } }],
    };
    (generateIndoorDirections as jest.Mock).mockReturnValue(validDirectionsForLoad);

    const { getByTestId } = render(<IndoorMap destinationRoom={destinationRoom} />);

    globalMiMapViewRef.current = fakeMapView;

    await act(async () => {
      await getByTestId('miMapView').props.onFirstMapLoaded();
    });

    expect(fakeSetMap).toHaveBeenCalledWith('floor2');
  });

  it('alerts when no directions found for destination room on first map load', async () => {
    (generateIndoorDirections as jest.Mock).mockReturnValue(null);

    const { getByTestId } = render(<IndoorMap destinationRoom={destinationRoom} />);

    const fakeSetMap = jest.fn().mockResolvedValue(undefined);
    const fakeMapView = {
      currentMap: { id: 'floor1' },
      venueData: { maps: [{ id: 'floor1', name: 'Floor 1' }] },
      setMap: fakeSetMap,
    };

    globalMiMapViewRef.current = fakeMapView;

    await act(async () => {
      await getByTestId('miMapView').props.onFirstMapLoaded();
    });

    expect(Alert.alert).toHaveBeenCalledWith('No Directions Found', expect.stringContaining('H-833'));
  });

  it('updates map when onMapChanged is called', async () => {
    const fakeSetMap = jest.fn().mockResolvedValue(undefined);
    const fakeMapView = {
      currentMap: { id: 'floor1' },
      setMap: fakeSetMap,
    };
    const { getByTestId } = setup();

    globalMiMapViewRef.current = fakeMapView;

    act(() => {
      getByTestId('miMapView').props.onMapChanged({ map: { id: 'newFloor' } });
    });

    await waitFor(() => expect(fakeSetMap).toHaveBeenCalledWith('newFloor'));
  });

  it('handles building change with functional update', async () => {
    const { getByTestId } = setup();

    fireEvent.press(getByTestId('settingsButton'));
    await waitFor(() => expect(getByTestId('buildingFloorModal')).toBeTruthy());

    mockTriggerBuildingChange = (onChangeBuilding: (v: any) => void) =>
      onChangeBuilding(() => 'functional-building-id');
    fireEvent.press(getByTestId('triggerBuildingChangeButton'));
    await waitFor(() => expect(getByTestId('loaderContainer')).toBeTruthy());
  });

  it('calls Journey.clear when cancelling directions', async () => {
    const fakeJourney = { clear: jest.fn() };
    const fakeMapView = {
      Journey: fakeJourney,
    };

    const { getByTestId, queryByTestId } = setup();

    globalMiMapViewRef.current = fakeMapView;

    await triggerDirectionsModal(getByTestId, validDirections);

    await waitFor(() => expect(getByTestId('directionsOverlay')).toBeTruthy());

    fireEvent.press(getByTestId('cancelDirectionsButton'));
    await waitFor(() => {
      expect(queryByTestId('directionsOverlay')).toBeNull();
      expect(fakeJourney.clear).toHaveBeenCalled();
    });
  });
});