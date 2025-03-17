import { Coordinates } from "@/app/utils/types";

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula.
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Determine whether a given point is inside a polygon.
 */
export const isPointInPolygon = (point: Coordinates, polygon: Coordinates[]): boolean => {
  const { latitude: x, longitude: y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude,
          yi = polygon[i].longitude;
    const xj = polygon[j].latitude,
          yj = polygon[j].longitude;
    const intersect = (yi > y) !== (yj > y) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

/**
 * Calculate the center of a polygon based on its coordinates.
 */
export const getPolygonCenter = (polygon: Coordinates[]): Coordinates => {
  const sum = polygon.reduce(
    (acc, point) => ({
      latitude: acc.latitude + point.latitude,
      longitude: acc.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );
  return {
    latitude: sum.latitude / polygon.length,
    longitude: sum.longitude / polygon.length,
  };
};
