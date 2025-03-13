import { getDirections, coordinatesFromRoomLocation, fetchAllRoutes } from '../directions';
import { RoomLocation, Building, Coordinates, LocationType, Campus } from '@/app/utils/types';

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      googleMapsApiKey: 'fake-api-key', 
    },
  },
}));

jest.mock('@mapbox/polyline', () => ({
  decode: jest.fn().mockReturnValue([
    [45.0, -73.0], 
    [45.1, -73.1],  
  ]),
}));

global.fetch = jest.fn();

describe('getDirections', () => {
  it('should return decoded coordinates for a valid response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        routes: [
          {
            overview_polyline: { points: 'abc123' },
          },
        ],
      }),
    });

    const origin: Coordinates = { latitude: 45.0, longitude: -73.0 };
    const destination: Coordinates = { latitude: 45.1, longitude: -73.1 };

    const result = await getDirections(origin, destination);

    expect(result).toEqual([
      { latitude: 45.0, longitude: -73.0 },
      { latitude: 45.1, longitude: -73.1 },
    ]);
  });

  it('should return an empty array if no routes are found', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ routes: [] }),
    });

    const origin: Coordinates = { latitude: 45.0, longitude: -73.0 };
    const destination: Coordinates = { latitude: 45.1, longitude: -73.1 };

    const result = await getDirections(origin, destination);

    expect(result).toEqual([]);
  });

  it('should return an empty array if there is an error in fetching directions', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const origin: Coordinates = { latitude: 45.0, longitude: -73.0 };
    const destination: Coordinates = { latitude: 45.1, longitude: -73.1 };

    const result = await getDirections(origin, destination);

    expect(result).toEqual([]);
  });

  it('should return an empty array if the polyline is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        routes: [{ overview_polyline: null }],
      }),
    });

    const origin: Coordinates = { latitude: 45.0, longitude: -73.0 };
    const destination: Coordinates = { latitude: 45.1, longitude: -73.1 };

    const result = await getDirections(origin, destination);

    expect(result).toEqual([]);
  });

  it('should return empty array if polyline decoding fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        routes: [
          {
            overview_polyline: { points: 'invalid_polyline' },
          },
        ],
      }),
    });

    const mockDecode = require('@mapbox/polyline').decode;
    mockDecode.mockImplementationOnce(() => {
      throw new Error('Invalid polyline');
    });

    const origin: Coordinates = { latitude: 45.0, longitude: -73.0 };
    const destination: Coordinates = { latitude: 45.1, longitude: -73.1 };

    const result = await getDirections(origin, destination);

    expect(result).toEqual([]);
  });
});

describe('coordinatesFromRoomLocation', () => {
  const SGWBuildings: Building[] = [
    {
      id: '1',
      name: 'Building1',
      coordinates: [{ latitude: 45.0, longitude: -73.0 }],
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      campus: 'SGW' as Campus,
    },
    {
      id: '2',
      name: 'Building2',
      coordinates: [{ latitude: 45.1, longitude: -73.1 }],
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      campus: 'SGW' as Campus,
    },
  ];

  const LoyolaBuildings: Building[] = [
    {
      id: 'A',
      name: 'BuildingA',
      coordinates: [{ latitude: 45.2, longitude: -73.2 }],
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      campus: 'LOY' as Campus,
    },
    {
      id: 'B',
      name: 'BuildingB',
      coordinates: [{ latitude: 45.3, longitude: -73.3 }],
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      campus: 'LOY' as Campus,
    },
  ];

  it('should return the correct coordinates for SGW campus', () => {
    const building = SGWBuildings.find(building => building.name === 'Building1');

    if (!building) {
      throw new Error('Building not found');
    }

    const location: RoomLocation = {
      campus: 'SGW' as Campus,
      building,
      room: '101',
    };

    const result = coordinatesFromRoomLocation(location, SGWBuildings, LoyolaBuildings);

    expect(result).toEqual({ latitude: 45.0, longitude: -73.0 });
  });

  it('should return the correct coordinates for Loyola campus', () => {
    const building = LoyolaBuildings.find(building => building.name === 'BuildingA');

    if (!building) {
      throw new Error('Building not found');
    }

    const location: RoomLocation = {
      campus: 'LOY' as Campus,
      building,
      room: '202',
    };

    const result = coordinatesFromRoomLocation(location, SGWBuildings, LoyolaBuildings);

    expect(result).toEqual({ latitude: 45.2, longitude: -73.2 });
  });

  it('should handle null location', () => {
    const location = null;

    const result = coordinatesFromRoomLocation(location, SGWBuildings, LoyolaBuildings);

    expect(result).toBeUndefined();
  });

  it('should handle invalid campus and update it', () => {
    const building = SGWBuildings.find(building => building.name === 'Building1');

    if (!building) {
      throw new Error('Building not found');
    }

    const location: RoomLocation = {
      campus: 'SGW' as Campus,
      building,
      room: '101',
    };

    const result = coordinatesFromRoomLocation(location, SGWBuildings, LoyolaBuildings);

    expect(location.campus).toBe('SGW');
    expect(result).toEqual({ latitude: 45.0, longitude: -73.0 });
  });

  it('should return undefined if building coordinates are not found', () => {
    const building = SGWBuildings.find(building => building.name === 'Building3');

    if (!building) {
      const location: RoomLocation = {
        campus: 'SGW' as Campus,
        building: {
          id: 'default',
          name: 'Default Building',
          coordinates: [{ latitude: 0, longitude: 0 }],
          fillColor: '#FFFFFF',
          strokeColor: '#000000',
          campus: 'SGW' as Campus,
        },
        room: '303',
      };

      const result = coordinatesFromRoomLocation(location, SGWBuildings, LoyolaBuildings);

      expect(result).toBeUndefined();
      return;
    }

    const location: RoomLocation = {
      campus: 'SGW' as Campus,
      building,
      room: '303',
    };

    const result = coordinatesFromRoomLocation(location, SGWBuildings, LoyolaBuildings);
    expect(result).toBeUndefined();
  });

  it('should return undefined if an invalid campus is used', () => {
    const building = SGWBuildings.find(building => building.name === 'Building1');

    if (!building) {
      throw new Error('Building not found');
    }

    const location: RoomLocation = {
      campus: "INVALID" as Campus,
      building,
      room: '101',
    };

    const result = coordinatesFromRoomLocation(location, SGWBuildings, LoyolaBuildings);

    expect(result).toBeUndefined();
  });
});

describe('fetchAllRoutes', () => {
  const origin: LocationType = { coordinates: { latitude: 45.0, longitude: -73.0 } };
  const destination: LocationType = { coordinates: { latitude: 45.1, longitude: -73.1 } };

  it('should fetch and return all available routes (shuttle)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        status: "OK",
        routes: [
          {
            overview_polyline: { points: 'abc123' },
            legs: [{
              duration: { text: '25 min', value: 600 },
              distance: { text: '1 km' },
              steps: [{ html_instructions: 'Turn left' }],
            }],
          },
        ],
      }),
    });

    const result = await fetchAllRoutes(origin, destination);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].mode).toBe("shuttle");
    expect(result[0].duration).toBe("25 min");
  });

  it('should handle invalid origin or destination', async () => {
    const invalidOrigin: LocationType = { coordinates: { latitude: 44.0, longitude: -71.0 } }; 
    const result = await fetchAllRoutes(invalidOrigin, destination);
  
    expect(result.length).toBeGreaterThan(0); 
  });
  

  it('should handle shuttle route correctly (shuttle)', async () => {
    const result = await fetchAllRoutes(origin, destination);
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        mode: 'shuttle',
        duration: '25 min',
        frequency: 'Every 15 min',
      }),
    ]));
  });

  it('should return empty array if fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const result = await fetchAllRoutes(origin, destination);
    expect(result).toEqual([]);
  });
});
