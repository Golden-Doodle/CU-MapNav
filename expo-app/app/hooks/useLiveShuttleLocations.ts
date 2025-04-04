import { useState, useEffect } from "react";
import { fetchBusCoordinates } from "@/app/services/ConcordiaShuttle/ConcordiaApiShuttle";
import { BusObject } from "@/app/utils/types";

const useLiveShuttleLocations = (displayLiveShuttleLocation: boolean) => {
  const [liveShuttleLocations, setLiveShuttleLocations] = useState<BusObject[]>([]);

  useEffect(() => {
    if (!displayLiveShuttleLocation) {
      return;
    }

    let intervalId: NodeJS.Timeout;

    const fetchShuttleLocations = async () => {
      try {
        const locations = await fetchBusCoordinates();
        setLiveShuttleLocations(locations);
        console.log("Fetched Shuttle Locations: ", locations);
      } catch (error) {
        console.error("Error fetching shuttle locations: ", error);
      }
    };

    fetchShuttleLocations(); // initial fetch

    intervalId = setInterval(fetchShuttleLocations, 60000); // Fetch every 60 seconds

    return () => clearInterval(intervalId);
  }, [displayLiveShuttleLocation]);

  return liveShuttleLocations;
};

export default useLiveShuttleLocations;
