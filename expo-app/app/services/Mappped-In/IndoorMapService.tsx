// IndoorMapService.ts
import { MapViewStore, MappedinDirections } from '@mappedin/react-native-sdk';
import React from 'react';

export interface RoomItem {
  label: string;
  value: string;
}

/**
 * Fetch room items from the venue data.
 */
export const fetchRoomItems = (
  mapView: React.RefObject<MapViewStore>
): RoomItem[] => {
  if (mapView.current && mapView.current.venueData) {
    const locations = mapView.current.venueData.locations || [];
    return locations.map((loc: any) => ({ label: loc.name, value: loc.name }));
  }
  return [];
};

/**
 * Generate directions between two rooms.
 */
export const generateDirections = (
  mapView: React.RefObject<MapViewStore>,
  startRoom: string,
  destinationRoom: string
): MappedinDirections | null => {
  if (!mapView.current) return null;

  const allLocations = mapView.current.venueData?.locations || [];
  const departure = allLocations.find((l: any) => l.name === startRoom);
  const destination = allLocations.find((l: any) => l.name === destinationRoom);

  if (!departure || !destination) {
    return null;
  }

  const directions = departure.directionsTo(destination);
  if (directions) {
    mapView.current.Journey.draw(directions);
    return directions;
  }
  return null;
};

/**
 * Clear any active directions.
 */
export const clearDirections = (mapView: React.RefObject<MapViewStore>): void => {
  if (mapView.current?.Journey.clear) {
    mapView.current.Journey.clear();
  }
};
