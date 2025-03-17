import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SearchModal from '../NavigateModal'; 
import { Building, Coordinates, CustomMarkerType } from '@/app/utils/types';
import { act } from "react-test-renderer";

describe('SearchModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectBuilding = jest.fn();
  const mockOnPressSelectOnMap = jest.fn();
  const mockOnGetDirections = jest.fn();

  const buildings: Building[] = [
    { 
      id: '1',
      name: 'Building 1',
      coordinates: [{ latitude: 45.497, longitude: -73.579 }],
      fillColor: '#FF5733',
      strokeColor: '#C70039',
      campus: 'SGW',
    },
    { 
      id: '2',
      name: 'Building 2',
      coordinates: [{ latitude: 45.498, longitude: -73.580 }],
      fillColor: '#33FF57',
      strokeColor: '#39C700',
      campus: 'LOY',
    },
    { 
      id: '3',
      name: 'Building 3',
      coordinates: [{ latitude: 45.499, longitude: -73.581 }],
      fillColor: '#3357FF',
      strokeColor: '#39C7FF',
      campus: 'SGW',
    },
  ];

  const markers: CustomMarkerType[] = [
    {
      id: '1',
      title: 'Marker 1',
      description: 'Description for marker 1',
      coordinate: { latitude: 45.497, longitude: -73.579 },
      campus: 'SGW',
    },
  ];

  const destination: Coordinates | null = { latitude: 45.497, longitude: -73.579 };

  it('renders correctly when visible is true', async () => {
    const { getByText } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildings={buildings}
        onSelectBuilding={mockOnSelectBuilding}
        markers={markers}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={destination}
        onGetDirections={mockOnGetDirections}
      />
    );
    
    await waitFor(() => {
        expect(getByText('Select Destination')).toBeTruthy();
    })
  });

  it('does not render when visible is false', async () => {
    const { queryByText } = render(
      <SearchModal
        visible={false}
        onClose={mockOnClose}
        buildings={buildings}
        onSelectBuilding={mockOnSelectBuilding}
        markers={markers}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={destination}
        onGetDirections={mockOnGetDirections}
      />
    );

    await waitFor(() => {
        expect(queryByText('Select Destination')).toBeNull();
    })
  });

  it('updates search query when typing in the input field', async () => {
    const { getByPlaceholderText } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildings={buildings}
        onSelectBuilding={mockOnSelectBuilding}
        markers={markers}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={destination}
        onGetDirections={mockOnGetDirections}
      />
    );

    const input = getByPlaceholderText('Search for destination...');

    await act(async () => {
        fireEvent.changeText(input, 'Building 1');
    })

    await waitFor(() => {
        expect(input.props.value).toBe('Building 1');
    })
  });

  it('filters the buildings based on the search query', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildings={buildings}
        onSelectBuilding={mockOnSelectBuilding}
        markers={markers}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={destination}
        onGetDirections={mockOnGetDirections}
      />
    );

    const input = getByPlaceholderText('Search for destination...');

    await act(async () => {
        fireEvent.changeText(input, 'Building 1');
    });

    await waitFor(() => {
      expect(getByText('Building 1')).toBeTruthy();
      expect(queryByText('Building 2')).toBeNull();
      expect(queryByText('Building 3')).toBeNull();
    });
  });

  it('calls onSelectBuilding when a result is selected', async () => {
    const { getByPlaceholderText, getByText } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildings={buildings}
        onSelectBuilding={mockOnSelectBuilding}
        markers={markers}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={null}
        onGetDirections={mockOnGetDirections}
      />
    );
  
    const input = getByPlaceholderText('Search for destination...');

    await act(async () => {
        fireEvent.changeText(input, 'Building 1');
    })

    await waitFor(() => {
      expect(getByText('Building 1')).toBeTruthy();
    });

    await act(async () => {
        fireEvent.press(getByText('Building 1'));
    })
    
    await waitFor(() => {
        expect(mockOnSelectBuilding).toHaveBeenCalledWith(buildings[0]);
    })
  });

  it('calls onPressSelectOnMap when Select on Map button is clicked', async () => {
    const { getByText } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildings={buildings}
        onSelectBuilding={mockOnSelectBuilding}
        markers={markers}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={null}
        onGetDirections={mockOnGetDirections}
      />
    );
  
    await act(async () => {
        fireEvent.press(getByText('Select on Map')); 
    })
    
    await waitFor(() => {
        expect(mockOnPressSelectOnMap).toHaveBeenCalled();
    })
  });

  it('calls onGetDirections when Get Directions button is clicked', async () => {
    const { getByText } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildings={buildings}
        onSelectBuilding={mockOnSelectBuilding}
        markers={markers}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={destination}
        onGetDirections={mockOnGetDirections}
      />
    );

    await act(async () => {
        fireEvent.press(getByText('Get Directions'));
    })

    await waitFor(() => {
        expect(mockOnGetDirections).toHaveBeenCalled();
    })
  });

  it('calls onClose when Close button is clicked', async () => {
    const { getByText } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildings={buildings}
        onSelectBuilding={mockOnSelectBuilding}
        markers={markers}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={destination}
        onGetDirections={mockOnGetDirections}
      />
    );

    await act(async () => {
        fireEvent.press(getByText('Close'))
    });

    await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
    })
  });
});
