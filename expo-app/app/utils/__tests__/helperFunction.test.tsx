import { getFillColorWithOpacity, getCenterCoordinate } from "../helperFunctions";
import {
  Building,
} from "../types";

const building: Building = {
  id: "1",
  name: "Building1",
  fillColor: "#FF5733",
  coordinates: [{ latitude: 45.0, longitude: -73.0 }],
  strokeColor: "#000000",
  campus: "SGW",
};

describe("getFillColorWithOpacity", () => {

  it("should return the concordia burgendy in hex with 1 opacity", () => {
    const result = getFillColorWithOpacity(building, building, building);

    expect(result).toBe("rgba(140, 38, 51, 1)");
  });

  it("should return the concordia burgendy in hex with 0.8 opacity", () => {
    const result = getFillColorWithOpacity(building, building, null);

    expect(result).toBe("rgba(140, 38, 51, 0.8)");
  });

  it("should handle different hex color and return correct RGBA with opacity 0.4 for unselected building", () => {

    const result = getFillColorWithOpacity({...building, fillColor: "rgba(244, 24, 24, 1)"}, null, null);

    expect(result).toBe("rgba(244, 24, 24, 0.4)");
  });

  it("should handle selected building with a different hex color and return opacity 1", () => {

    const result = getFillColorWithOpacity(
      { ...building, fillColor: "rgba(244, 24, 24, 1)" },
      null,
      building
    );

    expect(result).toBe("rgba(244, 24, 24, 1)");
  });

  it("should return undefined or handle invalid hex values gracefully", () => {
    const selectedBuilding: Building | undefined = undefined;
    const building: Building = {
      id: "4",
      name: "Building4",
      fillColor: "#XYZ123",
      coordinates: [{ latitude: 45.3, longitude: -73.3 }],
      strokeColor: "#000000",
      campus: "SGW",
    };

    const currentBuilding: Building | undefined = undefined;

    const result = getFillColorWithOpacity(
      building,
      currentBuilding,  
      selectedBuilding
    );

    expect(result).toBe("rgba(0, 0, 0, 0.4)");
  });
});


describe("getCenterCoordinate", () => {
  it("should return the center for two coordinates", () => {
    const coordinates = [
      { latitude: 0, longitude: 0 },
      { latitude: 2, longitude: 2 },
    ];
    const expectedCenter = { latitude: 1, longitude: 1 };
    const result = getCenterCoordinate(coordinates);
    expect(result.latitude).toBeCloseTo(expectedCenter.latitude);
    expect(result.longitude).toBeCloseTo(expectedCenter.longitude);
  });

  it("should return the same coordinate if only one coordinate is provided", () => {
    const coordinates = [{ latitude: 5, longitude: -3 }];
    const result = getCenterCoordinate(coordinates);
    expect(result.latitude).toBeCloseTo(5);
    expect(result.longitude).toBeCloseTo(-3);
  });

  it("should return the correct center for multiple coordinates", () => {
    const coordinates = [
      { latitude: 0, longitude: 0 },
      { latitude: 4, longitude: 4 },
      { latitude: 2, longitude: 2 },
    ];
    const expectedCenter = { latitude: 2, longitude: 2 };
    const result = getCenterCoordinate(coordinates);
    expect(result.latitude).toBeCloseTo(expectedCenter.latitude);
    expect(result.longitude).toBeCloseTo(expectedCenter.longitude);
  });
});