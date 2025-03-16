import Constants from "expo-constants";
import { decode } from "@mapbox/polyline";
import {
  Coordinates,
  RoomLocation,
  Building,
  Campus,
  LocationType,
  TransportMode,
} from "@/app/utils/types";
import polyline from "@mapbox/polyline";
import { RouteOption } from "@/app/utils/types";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

export const getDirections = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<Coordinates[]> => {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const points = data.routes[0].overview_polyline.points;
      const decodedPoints = decode(points).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
      return decodedPoints;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const coordinatesFromRoomLocation = (
  location: RoomLocation | null,
  buildings: Building[]
): Coordinates | undefined => {
  if (!location) {
    return;
  }

  if (!location.campus) return;

  const validateCampus = () => {
    if (location.campus !== "SGW" && location.campus !== "LOY") {
      const newCampus = (location.campus as string).toUpperCase();

      if (newCampus === "SGW" || newCampus === "LOY") {
        location.campus = newCampus as Campus;
      }
    }
  };

  validateCampus();

  const coordinates: Coordinates | undefined = buildings.find(
    (building: Building) =>
      location.campus === building.campus && building.name === location.building.name
  )?.coordinates[0];

  // const coordinates: Coordinates | undefined =
  //   location.campus === "SGW"
  //     ? SGWBuildings.find(
  //         (building: Building) => building.name === location.building.name
  //       )?.coordinates[0]
  //     : LoyolaBuildings.find(
  //         (building) => building.name === location.building.name
  //       )?.coordinates[0];

  if (!coordinates) {
    return;
  }

  return coordinates;
};

export const fetchAllRoutes = async (
  origin: LocationType,
  destination: LocationType
): Promise<RouteOption[]> => {
  if (!origin || !destination || !origin.coordinates || !destination.coordinates) {
    console.error("Invalid origin or destination");
    return [];
  }

  const modes: TransportMode[] = ["walking", "driving", "transit", "bicycling"];
  const routesData: RouteOption[] = [];

  let index = 0;
  try {
    const requests = modes.map(async (mode: TransportMode) => {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.coordinates.latitude},${origin.coordinates.longitude}&destination=${destination.coordinates.latitude},${destination.coordinates.longitude}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const route = data.routes[0];
        const legs = route.legs[0];
        const transportDetails: string[] = [];

        // Extract transport details from steps (for transit mode)
        if (mode === "transit") {
          legs.steps.forEach((step: any) => {
            if (step.transit_details) {
              const line = step.transit_details.line;
              if (line) {
                transportDetails.push(`${line.vehicle.name} ${line.short_name}`);
              }
            }
          });
        }

        routesData.push({
          id: `${index++}`,
          mode,
          duration: legs.duration.text,
          durationValue: legs.duration.value,
          distance: legs.distance.text,
          steps: legs.steps.map((step: any) => step.html_instructions),
          routeCoordinates: polyline
            .decode(route.overview_polyline.points)
            .map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
          transport: mode === "transit" ? transportDetails.join(" & ") : undefined,
          departure_time: mode === "transit" ? legs.departure_time : undefined,
          arrival_time: mode === "transit" ? legs.arrival_time : undefined,
          cost: mode === "transit" ? legs.fare?.text : undefined,
        });
      }
    });

    // Handle shuttle mode separately
    const handleShuttleRoute = async () => {
      // Placeholder logic for shuttle mode (replace with actual Concordia API if available)
      routesData.push({
        id: `${index++}`,
        mode: "shuttle",
        duration: "25 min",
        durationValue: 1500,
        distance: "N/A",
        steps: ["Board the Concordia Shuttle at Loyola Campus", "Arrive at SGW Campus"],
        routeCoordinates: [
          {
            latitude: origin.coordinates.latitude,
            longitude: origin.coordinates.longitude,
          },
          {
            latitude: destination.coordinates.latitude,
            longitude: destination.coordinates.longitude,
          },
        ],
        cost: "Free for students",
        frequency: "Every 15 min",
      });
    };

    // Wait for all API requests to finish
    await Promise.all([...requests, handleShuttleRoute()]);

    // Update state with all route options
    return routesData;
  } catch (error) {
    console.error("Error fetching routes:", error);
  }

  return [];
};
