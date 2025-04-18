export type Campus = "SGW" | "LOY";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Building = {
  id: string;
  name: string;
  coordinates: Coordinates[];
  fillColor: string;
  strokeColor: string;
  description?: string;
  campus: Campus;
  photoUrl?: string;
  rating?: number;
};

export type CustomMarkerType = {
  id: string;
  title: string;
  description?: string;
  coordinate: Coordinates;
  campus?: Campus;
  photoUrl?: string;
  rating?: number;
  markerType?: "restaurant" | "cafe" | "washroom" | "default";
};

export type RoomLocation = {
  room: string;
  building: Building;
  campus: Campus;
};

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus: string;
  }>;
}

export type SelectedBuildingType = Building | null | "markerOnMap";

export const concordiaBurgendyColor = "#8C2633";
export const SGW_FILL_COLOR = "rgba(0, 0, 255, 1)";
export const SGW_STROKE_COLOR = "rgba(0, 0, 0, 1)";
export const LOY_FILL_COLOR = "rgba(255, 165, 0, 1)";
export const LOY_STROKE_COLOR = "rgba(0, 0, 0, 1)";

export type LocationType = {
  userLocation?: boolean;
  coordinates: Coordinates;
  building?: Building;
  room?: RoomLocation;
  floor?: number;
  campus?: Campus;
  selectedBuilding?: boolean;
} | null;

export type TransportMode =
  | "transit" // Google maps
  | "walking" // Google maps
  | "driving" // Google maps
  | "bicycling" // Google maps
  | "shuttle"; // Concordia shuttle

export type RouteOption = {
  id: string;
  mode: TransportMode;
  duration: string; // Estimated travel time (e.g., "15 min")
  durationValue: number; // Duration in seconds
  distance: string; // Distance (e.g., "3.2 km")
  steps: string[]; // Turn-by-turn instructions (HTML formatted)
  routeCoordinates: Coordinates[]; // Decoded polyline route coordinates
  cost?: string; // Cost of the route (e.g., "$3.25")
  frequency?: string; // Frequency of the shuttle (e.g., "Every 15 min")
  transport?: string; // Transport type (e.g., "Bus 105 & 24")
  arrival_time?: {
    // ['Walking'] does not have arrival time
    text: string; // Arrival time (e.g., "14:10")
    value: number; // Arrival time in seconds
    time_zone: string; // Time zone (e.g., "America/Toronto")
  };
  departure_time?: {
    // ['Walking'] does not have departure time
    text: string; // Departure time (e.g., "13:32")
    value: number; // Departure time in seconds
    time_zone: string; // Time zone (e.g., "America/Toronto")
  };
};

export type GooglePlace = {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity: string;
  rating?: number;
  photos?: {
    height: number;
    width: number;
    photo_reference: string;
    imageUrl: string;
  }[];
  types?: string[];
};

export type ShuttlePointObject = {
  PointStatus: string;
  Address: string;
  ID: string;
  IconImage: string;
  IconShadowImage: string;
  IconImageWidth:   number;
  IconShadowWidth:  number;
  IconShadowHeight: number;
  IconAnchor_posX:  number;
  IconAnchor_posY:  number;
  InfoWindowAnchor_posX: number;
  InfoWindowAnchor_posY: number;
  Draggable: boolean;
  IconImageHeight: number;
  Latitude: number;
  Longitude: number;
  InfoHTML: string;
  ToolTip: string;
};

export type BusObject = {
  id: string;
  coordinates: Coordinates;
};
