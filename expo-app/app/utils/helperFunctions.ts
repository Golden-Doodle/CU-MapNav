import { Building, concordiaBurgendyColor, LocationType } from "./types";

export const getFillColorWithOpacity = (
  building: Building,
  currentBuilding: Building | null = null,
  selectedBuilding: Building | null = null
) => {
  // If the user is inside the building, make it red
  if (currentBuilding && currentBuilding.id === building.id) {
    const opacity = selectedBuilding?.id === building.id ? 1 : 0.8;
    return updateRgbaAlpha(hexToRgba(concordiaBurgendyColor, 1), opacity);
  }

  // Get the building's original fill color
  let fillColor = building.fillColor || "rgba(0, 0, 0, 0)";

  // Convert hex color to rgba if necessary
  if (fillColor.startsWith("#")) {
    fillColor = hexToRgba(fillColor, 1); // Default to full opacity
  }

  // Apply opacity filter if the building is not selected
  const opacity = selectedBuilding?.id === building.id ? 1 : 0.4;
  return updateRgbaAlpha(fillColor, opacity);
};

// Helper function to update the opacity in an RGBA string safely
const updateRgbaAlpha = (rgba: string, alpha: number) => {
  return rgba.replace(/(rgba\(\d+,\s*\d+,\s*\d+,\s*)[\d.]+(\))/, `$1${alpha}$2`);
};

// Function to convert HEX to RGBA
const hexToRgba = (hex: string, alpha: number): string => {
  // Validate the hex format (6-digit or 3-digit with optional #)
  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  if (!hexRegex.test(hex)) {
    console.warn(`Invalid hex color provided: ${hex}`);
    return `rgba(0, 0, 0, ${alpha})`; // Default to black with given opacity
  }

  // Expand short hex (e.g., #abc -> #aabbcc)
  let fullHex = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;

  const r = parseInt(fullHex.slice(1, 3), 16);
  const g = parseInt(fullHex.slice(3, 5), 16);
  const b = parseInt(fullHex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

