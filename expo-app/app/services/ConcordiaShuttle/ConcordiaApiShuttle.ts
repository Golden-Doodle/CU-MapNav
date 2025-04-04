import { BusObject, ShuttlePointObject } from "@/app/utils/types";

export const fetchBusLocations = async () => {
  const url = `https://us-central1-soen-390-golden-doodle.cloudfunctions.net/api/v1/bus-locations`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching bus locations:", error);
    throw error;
  }
};

export const fetchBusCoordinates = async () => {
  try {
    const data = await fetchBusLocations();

    const Points: ShuttlePointObject[] = data.d.Points;

    console.log("Bus Coordinates Data:", Points); // Debugging log

    const busObjects: BusObject[] = Points.map((point: ShuttlePointObject) => {
      if (point.ID.includes("BUS")) {
        return {
          id: point.ID,
          coordinates: {
            latitude: point.Latitude,
            longitude: point.Longitude,
          },
          status: point.PointStatus,
        };
      }
      return null;
    }).filter((bus) => bus !== null);

    return busObjects;
  } catch (error) {
    console.error("Error fetching bus coordinates:", error);
    throw error;
  }
};
