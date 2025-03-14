import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NavTab from '../CampusMapNavTab'; 
import { Building, LocationType } from '@/app/utils/types'; 

jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: jest.fn(() => <></>),
}));

describe('NavTab', () => {
  it('renders the correct navigation items when there is no destination', () => {
    const onSearchPress = jest.fn();
    const onTravelPress = jest.fn();
    const onEatPress = jest.fn();
    const onNextClassPress = jest.fn();
    const onMoreOptionsPress = jest.fn();

    const campus = "SGW";

    const { getByTestId } = render(
      <NavTab
        campus={campus}
        destination={null} 
        onSearchPress={onSearchPress}
        onTravelPress={onTravelPress}
        onEatPress={onEatPress}
        onNextClassPress={onNextClassPress}
        onMoreOptionsPress={onMoreOptionsPress}
        testID="nav-tab" 
      />
    );

    expect(getByTestId('nav-tab-nav-item-Search')).toBeTruthy();
    expect(getByTestId('nav-tab-nav-item-SGW')).toBeTruthy();
    expect(getByTestId('nav-tab-nav-item-Eat')).toBeTruthy();
    expect(getByTestId('nav-tab-nav-item-Class')).toBeTruthy();
    expect(getByTestId('nav-tab-nav-item-More')).toBeTruthy();
  });

  it('renders the correct navigation items when a building is selected as destination', () => {
    const onBackPress = jest.fn();
    const onInfoPress = jest.fn();
    const onDirectionsPress = jest.fn();

    const destination: LocationType = { 
      building: {
        id: "1",
        name: "Library",
        coordinates: [{ latitude: 123, longitude: 456 }],
        fillColor: "#FF0000",
        strokeColor: "#0000FF",
        campus: "SGW", 
      } as Building, 
      coordinates: { latitude: 123, longitude: 456 }, 
    };

    const campus = "SGW"; 

    const { getByTestId } = render(
      <NavTab
        campus={campus}
        destination={destination}
        onBackPress={onBackPress}
        onInfoPress={onInfoPress}
        onDirectionsPress={onDirectionsPress}
        testID="nav-tab" 
      />
    );

    expect(getByTestId('nav-tab-nav-item-Back')).toBeTruthy();
    expect(getByTestId('nav-tab-nav-item-Info')).toBeTruthy();
    expect(getByTestId('nav-tab-nav-item-Directions')).toBeTruthy();
  });

  it('renders the correct navigation items when coordinates are selected as destination', () => {
    const onBackPress = jest.fn();
    const onDirectionsPress = jest.fn();

    const destination: LocationType = { 
      coordinates: { latitude: 123, longitude: 456 } 
    };

    const campus = "SGW"

    const { getByTestId } = render(
      <NavTab
        campus={campus}
        destination={destination}
        onBackPress={onBackPress}
        onDirectionsPress={onDirectionsPress}
        testID="nav-tab" 
      />
    );

    expect(getByTestId('nav-tab-nav-item-Back')).toBeTruthy();
    expect(getByTestId('nav-tab-nav-item-Directions')).toBeTruthy();
  });

  it('calls the correct action when a navigation item is pressed', () => {
    const onSearchPress = jest.fn();

    const campus = "SGW";

    const { getByTestId } = render(
      <NavTab
        campus={campus}
        destination={null}
        onSearchPress={onSearchPress}
        testID="nav-tab"
      />
    );

    const searchButton = getByTestId('nav-tab-nav-item-Search');
    fireEvent.press(searchButton);

    expect(onSearchPress).toHaveBeenCalledTimes(1);
  });

  it('highlights the active tab when a navigation item is selected', () => {
    const campus = "SGW";

    const { getByText } = render(
      <NavTab
        campus={campus}
        destination={null}
        testID="nav-tab" 
      />
    );

    const searchButton = getByText('Search');
    fireEvent.press(searchButton);

    expect(searchButton.props.style[1]).toEqual(expect.objectContaining({ color: "#fff" }));
  });
});