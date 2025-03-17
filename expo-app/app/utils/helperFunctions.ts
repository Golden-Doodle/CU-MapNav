import { Building, concordiaBurgendyColor, LocationType } from "./types";

export const getFillColorWithOpacity = (
  building: Building,
  userLocation: LocationType | null,
  selectedBuilding: Building | null
) => {
  // If the user is inside the building, make it red
  if (userLocation?.building?.id === building.id) {
    return concordiaBurgendyColor;
  }

  // Get the building's original fill color
  let fillColor = building.fillColor || "rgba(0,0,0,0)";

  // Convert hex color to rgba if necessary
  if (fillColor.startsWith("#")) {
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    fillColor = hexToRgba(fillColor, 1); // Default to full opacity
  }

  // Apply opacity filter if the building is not selected
  const opacity = selectedBuilding?.id === building.id ? 1 : 0.4;
  return fillColor.replace(/[\d\.]+\)$/, `${opacity})`);
};
