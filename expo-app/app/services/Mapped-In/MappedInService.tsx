// MappedInService.ts
import { MapViewStore, MappedinDirections } from '@mappedin/react-native-sdk';
import React from 'react';

// Extend MappedinDirections to include custom fields
export interface ExtendedMappedinDirections extends MappedinDirections {
  startRoom: string;
  destinationRoom: string;
}

/**
 * Generate directions between two rooms using Mappedin’s default wayfinding.
 */
export const generateDirections = (
  mapView: React.RefObject<MapViewStore>,
  startRoom: string,
  destinationRoom: string,
  options?: { accessible?: boolean }
): MappedinDirections | null => {
  if (!mapView.current) return null;

  const allLocations = mapView.current.venueData?.locations || [];
  const departure = allLocations.find((l: any) => l.name === startRoom);
  const destination = allLocations.find((l: any) => l.name === destinationRoom);

  if (!departure || !destination) {
    console.warn('Unable to find matching rooms for start or destination.');
    return null;
  }

  // Use Mappedin's default directions method
  const directions = departure.directionsTo(destination, options);
  if (!directions) {
    console.warn('Mappedin returned no directions for the given rooms.');
    return null;
  }

  // Attach custom properties to the directions object
  (directions as ExtendedMappedinDirections).startRoom = startRoom;
  (directions as ExtendedMappedinDirections).destinationRoom = destinationRoom;

  // Draw on the map
  mapView.current.Journey.draw(directions);
  return directions;
};

/**
 * Fetch room items from the venue data.
 */
export const fetchRoomItems = (
  mapView: React.RefObject<MapViewStore>
): Array<{ label: string; value: string }> => {
  const locations = mapView.current?.venueData?.locations;
  if (!locations) return [];
  return locations.map((loc: any) => ({ label: loc.name, value: loc.name }));
};

/**
 * Clear active directions.
 */
export const clearDirections = (mapView: React.RefObject<MapViewStore>): void => {
  mapView.current?.Journey?.clear?.();
};
