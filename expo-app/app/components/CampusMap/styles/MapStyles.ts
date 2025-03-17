interface MapStyle {
  featureType?: string;
  elementType?: string;
  stylers: Array<{ [key: string]: string }>;
}

const createStyle = (
  featureType: string | null,
  elementType: string | null,
  stylers: Array<{ [key: string]: string }>
): MapStyle => {
  return {
    ...(featureType ? { featureType } : {}),
    ...(elementType ? { elementType } : {}),
    stylers,
  };
};

export const commonMapStyle: MapStyle[] = [
  createStyle("poi", "labels", [{ visibility: "off" }]),
  createStyle("transit", "labels", [{ visibility: "off" }]),
  createStyle("transit.station", "labels", [{ visibility: "off" }]),
];

export const darkMapOverrides: MapStyle[] = [
  createStyle(null, "geometry", [{ color: "#242f3e" }]),
  createStyle(null, "labels.text.fill", [{ color: "#746855" }]),
  createStyle(null, "labels.text.stroke", [{ color: "#242f3e" }]),
  createStyle("administrative.locality", "labels.text.fill", [{ color: "#d59563" }]),
  createStyle("poi", "labels.text.fill", [{ color: "#d59563" }]),
  createStyle("poi.park", "geometry", [{ color: "#263c3f" }]),
  createStyle("poi.park", "labels.text.fill", [{ color: "#6b9a76" }]),
  createStyle("road", "geometry", [{ color: "#38414e" }]),
  createStyle("road", "geometry.stroke", [{ color: "#212a37" }]),
  createStyle("road", "labels.text.fill", [{ color: "#9ca5b3" }]),
  createStyle("road.highway", "geometry", [{ color: "#746855" }]),
  createStyle("road.highway", "geometry.stroke", [{ color: "#1f2835" }]),
  createStyle("road.highway", "labels.text.fill", [{ color: "#f3d19c" }]),
  createStyle("transit", "geometry", [{ color: "#2f3948" }]),
  createStyle("transit.station", "labels.text.fill", [{ color: "#d59563" }]),
  createStyle("water", "geometry", [{ color: "#17263c" }]),
  createStyle("water", "labels.text.fill", [{ color: "#515c6d" }]),
  createStyle("water", "labels.text.stroke", [{ color: "#17263c" }]),
];

export const getCustomMapStyle = (isDarkMode: boolean): MapStyle[] =>
  isDarkMode ? [...darkMapOverrides, ...commonMapStyle] : commonMapStyle;