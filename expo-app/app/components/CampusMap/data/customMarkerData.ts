import { CustomMarkerType } from "@/app/utils/types";

const initialRegion = {
  SGW: {
    latitude: 45.4971,
    longitude: -73.5792,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  LOY: {
    latitude: 45.458,
    longitude: -73.64,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
};

const SGWMarkers: CustomMarkerType[] = [
  {
    id: '1',
    title: "Concordia University - SGW",
    description: "SGW Campus",
    coordinate: { latitude: 45.4971, longitude: -73.5792 },
  },
  {
    id: '2',
    title: "Guy-Concordia Metro",
    description: "Public transport near campus",
    coordinate: { latitude: 45.4958, longitude: -73.5781 },
  },
];

const LoyolaMarkers: CustomMarkerType[] = [
  {
    id: '1',
    title: "Concordia University - Loyola",
    description: "Loyola Campus",
    coordinate: { latitude: 45.458, longitude: -73.64 },
  },
  {
    id: '2',
    title: "Loyola Chapel",
    description: "Historic chapel on Loyola Campus",
    coordinate: { latitude: 45.459, longitude: -73.641 },
  },
];

export { initialRegion, SGWMarkers, LoyolaMarkers };