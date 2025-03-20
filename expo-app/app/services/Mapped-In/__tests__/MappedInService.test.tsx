// IndoorMapService.test.ts
import { fetchRoomItems, generateDirections, clearDirections } from '../MappedInService';
import { MapViewStore, MappedinDirections } from '@mappedin/react-native-sdk';
import React from 'react';

describe('IndoorMapService', () => {
  let mapViewMock: React.RefObject<MapViewStore>;

  beforeEach(() => {
    mapViewMock = {
      current: {
        venueData: {
          locations: [
            { name: 'Room A', directionsTo: jest.fn() },
            { name: 'Room B', directionsTo: jest.fn() },
          ],
        },
        Journey: {
          draw: jest.fn(),
          clear: jest.fn(),
        },
      } as unknown as MapViewStore,
    };
  });

  describe('fetchRoomItems', () => {
    it('should return a list of room items', () => {
      const rooms = fetchRoomItems(mapViewMock);
      expect(rooms).toEqual([
        { label: 'Room A', value: 'Room A' },
        { label: 'Room B', value: 'Room B' },
      ]);
    });

    it('should return an empty array if no venue data available', () => {
      mapViewMock.current!.venueData = undefined;
      const rooms = fetchRoomItems(mapViewMock);
      expect(rooms).toEqual([]);
    });
  });

  describe('generateDirections', () => {
    it('should generate directions between two rooms', () => {
      const mockDirections = {} as MappedinDirections;
      (mapViewMock.current!.venueData!.locations[0].directionsTo as jest.Mock).mockReturnValue(mockDirections);

      const directions = generateDirections(mapViewMock, 'Room A', 'Room B');

      expect(mapViewMock.current!.venueData!.locations[0].directionsTo).toHaveBeenCalledWith(
        mapViewMock.current!.venueData!.locations[1]
      );
      expect(mapViewMock.current!.Journey.draw).toHaveBeenCalledWith(mockDirections);
      expect(directions).toBe(mockDirections);
    });

    it('should return null if start or destination room is not found', () => {
      const directions = generateDirections(mapViewMock, 'Room A', 'Non-existent Room');
      expect(directions).toBeNull();
    });

    it('should return null if directions cannot be generated', () => {
      (mapViewMock.current!.venueData!.locations[0].directionsTo as jest.Mock).mockReturnValue(null);

      const directions = generateDirections(mapViewMock, 'Room A', 'Room B');
      expect(mapViewMock.current!.Journey.draw).not.toHaveBeenCalled();
      expect(directions).toBeNull();
    });
  });

  describe('clearDirections', () => {
    it('should clear active directions', () => {
      clearDirections(mapViewMock);
      expect(mapViewMock.current!.Journey.clear).toHaveBeenCalled();
    });

    it('should not fail if Journey.clear is not available', () => {
        mapViewMock.current!.Journey.clear = jest.fn();
      expect(() => clearDirections(mapViewMock)).not.toThrow();
    });
  });
});
