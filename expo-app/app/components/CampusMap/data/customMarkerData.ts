import { CustomMarkerType } from "@/app/utils/types";

const markers: CustomMarkerType[] = [
  {
    id: "1",
    title: "Concordia University - SGW",
    description: "SGW Campus",
    coordinate: { latitude: 45.4971, longitude: -73.5792 },
    campus: "SGW",
  },
  {
    id: "2",
    title: "Guy-Concordia Metro",
    description: "Public transport near campus",
    coordinate: { latitude: 45.4958, longitude: -73.5781 },
    campus: "SGW",
  },
  {
    id: "3",
    title: "Concordia University - Loyola",
    description: "Loyola Campus",
    coordinate: { latitude: 45.458, longitude: -73.64 },
    campus: "LOY",
  },
  {
    id: "4",
    title: "Loyola Chapel",
    description: "Historic chapel on Loyola Campus",
    coordinate: { latitude: 45.459, longitude: -73.641 },
    campus: "LOY",
  },
];

export { markers };
