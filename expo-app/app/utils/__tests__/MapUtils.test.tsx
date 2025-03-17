import { calculateDistance, isPointInPolygon, getPolygonCenter } from '../MapUtils';

describe('calculateDistance', () => {
  it('returns 0 when both points are identical', () => {
    const distance = calculateDistance(0, 0, 0, 0);
    expect(distance).toBe(0);
  });

  it('calculates a reasonable distance between Berlin and Paris', () => {

    const distance = calculateDistance(52.5200, 13.4050, 48.8566, 2.3522);

    expect(distance).toBeGreaterThan(800000);
    expect(distance).toBeLessThan(900000);
  });
});


describe('isPointInPolygon', () => {
  const square = [
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 10 },
    { latitude: 10, longitude: 10 },
    { latitude: 10, longitude: 0 },
  ];

  it('returns true when the point is inside the polygon', () => {
    const pointInside = { latitude: 5, longitude: 5 };
    expect(isPointInPolygon(pointInside, square)).toBe(true);
  });

  it('returns false when the point is outside the polygon', () => {
    const pointOutside = { latitude: 15, longitude: 5 };
    expect(isPointInPolygon(pointOutside, square)).toBe(false);
  });
});

describe('getPolygonCenter', () => {
  it('calculates the center of a square correctly', () => {
    const square = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 10 },
      { latitude: 10, longitude: 10 },
      { latitude: 10, longitude: 0 },
    ];
    const center = getPolygonCenter(square);
    expect(center.latitude).toBeCloseTo(5);
    expect(center.longitude).toBeCloseTo(5);
  });

  it('calculates the center for an irregular polygon', () => {
    const polygon = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 4 },
      { latitude: 3, longitude: 4 },
      { latitude: 3, longitude: 2 },
      { latitude: 1, longitude: 0 },
    ];
    
    const center = getPolygonCenter(polygon);
    const expectedLatitude = (0 + 0 + 3 + 3 + 1) / 5;
    const expectedLongitude = (0 + 4 + 4 + 2 + 0) / 5;
    expect(center.latitude).toBeCloseTo(expectedLatitude);
    expect(center.longitude).toBeCloseTo(expectedLongitude);
  });
});
