import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import BuildingInfoModal from "../BuildingInfoModal";
import { Building } from "@/app/utils/types";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@/app/components/IndoorNavigation/IndoorMap", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: any) =>
    props.indoorBuildingId ? (
      React.createElement(Text, { testID: "indoor-map" }, "IndoorMap")
    ) : null;
});

const dummyBuilding: Building = {
  id: "H",
  name: "Test Building",
  description: "A test building",
  photoUrl: "http://example.com/photo.jpg",
  coordinates: [{ latitude: 10, longitude: 20 }],
  rating: 4.5,
  fillColor: "#000000",
  strokeColor: "#FFFFFF",
  campus: "SGW",
};

describe("BuildingInfoModal", () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onNavigate: jest.fn(),
    testID: "test",
    onUseAsOrigin: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders null if selectedBuilding is null", () => {
    const { queryByTestId } = render(
      <BuildingInfoModal {...defaultProps} selectedBuilding={null} />
    );
    expect(queryByTestId("test-overlay")).toBeNull();
  });

  it("renders building info modal when visible", () => {
    const { getByTestId, getByText } = render(
      <BuildingInfoModal {...defaultProps} selectedBuilding={dummyBuilding} />
    );
    expect(getByTestId("test-title").props.children).toBe(dummyBuilding.name);
    expect(getByTestId("test-description").props.children).toBe(dummyBuilding.description);
    expect(getByText(`Rating: ${dummyBuilding.rating} ★`)).toBeTruthy();
    expect(getByTestId("test-building-image")).toBeTruthy();
  });

  it("renders 'No description available' when description is missing", () => {
    const buildingNoDescription = { ...dummyBuilding, description: "" };
    const { getByTestId } = render(
      <BuildingInfoModal {...defaultProps} selectedBuilding={buildingNoDescription} />
    );
    expect(getByTestId("test-description").props.children).toBe("No description available");
  });

  it("does not render image or spinner when photoUrl is empty", () => {
    const buildingNoPhoto = { ...dummyBuilding, photoUrl: "" };
    const { queryByTestId } = render(
      <BuildingInfoModal {...defaultProps} selectedBuilding={buildingNoPhoto} />
    );
    expect(queryByTestId("test-building-image")).toBeNull();
    expect(queryByTestId("test-spinner")).toBeNull();
  });

  it("calls onClose when close button is pressed", () => {
    const onCloseMock = jest.fn();
    const { getByTestId } = render(
      <BuildingInfoModal {...defaultProps} selectedBuilding={dummyBuilding} onClose={onCloseMock} />
    );
    fireEvent.press(getByTestId("test-close-button"));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("calls onNavigate and onClose when navigate button is pressed", () => {
    const onNavigateMock = jest.fn();
    const onCloseMock = jest.fn();
    const { getByTestId } = render(
      <BuildingInfoModal
        {...defaultProps}
        selectedBuilding={dummyBuilding}
        onClose={onCloseMock}
        onNavigate={onNavigateMock}
      />
    );
    fireEvent.press(getByTestId("test-navigate-button"));
    expect(onNavigateMock).toHaveBeenCalledWith(
      dummyBuilding.coordinates[0].latitude,
      dummyBuilding.coordinates[0].longitude
    );
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("does not call onNavigate when selectedBuilding has no coordinates", () => {
    const buildingNoCoordinates = { ...dummyBuilding, coordinates: [] };
    const onNavigateMock = jest.fn();
    const onCloseMock = jest.fn();
    const { queryByTestId } = render(
      <BuildingInfoModal
        {...defaultProps}
        selectedBuilding={buildingNoCoordinates}
        onClose={onCloseMock}
        onNavigate={onNavigateMock}
      />
    );
    expect(queryByTestId("test-navigate-button")).toBeNull();
  });
  
  it("calls onUseAsOrigin when the 'Use as origin' button is pressed", () => {
    const onUseAsOriginMock = jest.fn();
    const { getByTestId } = render(
      <BuildingInfoModal
        {...defaultProps}
        selectedBuilding={dummyBuilding}
        onUseAsOrigin={onUseAsOriginMock}
      />
    );
    fireEvent.press(getByTestId("test-use-as-origin-button"));
    expect(onUseAsOriginMock).toHaveBeenCalled();
  });

  it("shows an alert when indoor map is not available", () => {
    const buildingNoIndoor: Building = { ...dummyBuilding, id: "XYZ" };
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(
      <BuildingInfoModal {...defaultProps} selectedBuilding={buildingNoIndoor} />
    );
    fireEvent.press(getByTestId("test-show-indoors-button"));
    expect(alertSpy).toHaveBeenCalledWith(
      "Indoor Map Not Available",
      "Indoor map is not available for this building."
    );
  });

  it("opens indoor map modal when building supports indoor map", () => {
    // Using a building id that supports indoor map: H, MB, or JMSB.
    const { getByTestId, getByText, queryByText } = render(
      <BuildingInfoModal {...defaultProps} selectedBuilding={dummyBuilding} />
    );
    expect(queryByText("Close Indoor Map")).toBeNull();
    fireEvent.press(getByTestId("test-show-indoors-button"));
    expect(getByText("Close Indoor Map")).toBeTruthy();
    expect(getByTestId("indoor-map")).toBeTruthy();
  });

  it("closes indoor map modal when the close indoor map button is pressed", () => {
    const { getByTestId, getByText, queryByText } = render(
      <BuildingInfoModal {...defaultProps} selectedBuilding={dummyBuilding} />
    );
    fireEvent.press(getByTestId("test-show-indoors-button"));
    const closeIndoorMapButton = getByText("Close Indoor Map");
    fireEvent.press(closeIndoorMapButton);
    expect(queryByText("Close Indoor Map")).toBeNull();
  });

  it("displays spinner while image is loading and hides after load end", async () => {
    const { getByTestId, queryByTestId } = render(
      <BuildingInfoModal {...defaultProps} selectedBuilding={dummyBuilding} />
    );
    const image = getByTestId("test-building-image");
    fireEvent(image, "loadStart");
    expect(getByTestId("test-spinner")).toBeTruthy();
    fireEvent(image, "loadEnd");
    await waitFor(() => {
      expect(queryByTestId("test-spinner")).toBeNull();
    });
  });
});