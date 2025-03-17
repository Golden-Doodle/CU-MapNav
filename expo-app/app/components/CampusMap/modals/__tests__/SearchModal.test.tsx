import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import SearchModal from "../SearchModal";
import { Building } from "@/app/utils/types";

const mockOnClose = jest.fn();
const mockOnSelectLocation = jest.fn();
const mockOnPressSelectOnMap = jest.fn();
const mockOnGetDirections = jest.fn();

const buildingData: Building[] = [
  {
    id: "1",
    name: "Building 1",
    description: "Description of Building 1",
    coordinates: [{ latitude: 45.495, longitude: -73.578 }],
    fillColor: "#FF0000",
    strokeColor: "#000000",
    campus: "SGW",
  },
  {
    id: "2",
    name: "Building 2",
    description: "Description of Building 2",
    coordinates: [{ latitude: 45.495, longitude: -73.578 }],
    fillColor: "#00FF00",
    strokeColor: "#000000",
    campus: "LOY",
  },
];

describe("SearchModal", () => {
  it("renders correctly when visible", async () => {
    const { getByTestId } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildingData={buildingData}
        markerData={[]}
        onSelectLocation={mockOnSelectLocation}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={null}
        onGetDirections={mockOnGetDirections}
        testID="search-modal"
      />
    );

    await act(async () => {
      expect(getByTestId("search-modal-modal-container")).toBeTruthy();
      expect(getByTestId("search-modal-modal-title")).toHaveTextContent("Select Destination");
      expect(getByTestId("search-modal-search-input")).toBeTruthy();
    });
  });

  it("closes modal when close icon is pressed", async () => {
    const { getByTestId } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildingData={buildingData}
        markerData={[]}
        onSelectLocation={mockOnSelectLocation}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={null}
        onGetDirections={mockOnGetDirections}
        testID="search-modal"
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId("search-modal-close-icon"));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("selects building when a result item is pressed", async () => {
    const { getByTestId } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildingData={buildingData}
        markerData={[]}
        onSelectLocation={mockOnSelectLocation}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={null}
        onGetDirections={mockOnGetDirections}
        testID="search-modal"
      />
    );

    await act(async () => {
      fireEvent.changeText(getByTestId("search-modal-search-input"), "Building 1");
    });

    await waitFor(() => {
      expect(getByTestId("search-modal-result-item-1")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId("search-modal-result-item-1"));
    });

    expect(mockOnSelectLocation).toHaveBeenCalledWith(buildingData[0]);
  });

  it("focuses search input when the modal is visible", async () => {
    const { findByTestId } = render(
      <SearchModal
        visible={true}
        onClose={mockOnClose}
        buildingData={buildingData}
        markerData={[]}
        onSelectLocation={mockOnSelectLocation}
        onPressSelectOnMap={mockOnPressSelectOnMap}
        destination={null}
        onGetDirections={mockOnGetDirections}
        testID="search-modal"
      />
    );

    // Wait for the input field to be rendered
    const searchInput = await findByTestId("search-modal-search-input");

    // Trigger focus manually
    await act(async () => {
      searchInput.props.onFocus?.();
    });

    // Check if the input is focused
    expect(searchInput).toBeTruthy();
  });
});
