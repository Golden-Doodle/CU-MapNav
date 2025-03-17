import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BuildingInfoModal from "../BuildingInfoModal";
import { Building } from "../../../../utils/types";

const mockNavigate = jest.fn();
const mockOnClose = jest.fn();
const mockUseAsOrigin = jest.fn();

export type Campus = "SGW" | "LOY";

const building: Building = {
  id: "1",
  name: "Building Name",
  description: "This is a description of the building.",
  photoUrl: "https://example.com/photo.jpg",
  rating: 4.5,
  coordinates: [{ latitude: 10.0, longitude: 20.0 }],
  fillColor: "#ff0000",
  strokeColor: "#00ff00",
  campus: "SGW",
};

describe("BuildingInfoModal", () => {
  it("renders correctly with building information", () => {
    const { getByText } = render(
      <BuildingInfoModal
        visible={true}
        onClose={mockOnClose}
        selectedBuilding={building}
        onNavigate={mockNavigate}
        testID="building-info-modal"
        onUseAsOrigin={mockUseAsOrigin}
      />
    );

    expect(getByText("Building Name")).toBeTruthy();
    expect(getByText("This is a description of the building.")).toBeTruthy();
    expect(getByText("Rating: 4.5 ★")).toBeTruthy();
  });

  it("calls onNavigate when navigate button is pressed", () => {
    const { getByText } = render(
      <BuildingInfoModal
        visible={true}
        onClose={mockOnClose}
        selectedBuilding={building}
        onNavigate={mockNavigate}
        testID="building-info-modal"
        onUseAsOrigin={mockUseAsOrigin}
      />
    );

    fireEvent.press(getByText("Navigate to this Building"));

    expect(mockNavigate).toHaveBeenCalledWith(10.0, 20.0);
  });

  it("calls onClose when close button is pressed", () => {
    const { getByTestId } = render(
      <BuildingInfoModal
        visible={true}
        onClose={mockOnClose}
        selectedBuilding={building}
        onNavigate={mockNavigate}
        testID="building-info-modal"
        onUseAsOrigin={mockUseAsOrigin}
      />
    );

    fireEvent.press(getByTestId("building-info-modal-close-button"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("does not render modal when selectedBuilding is null or undefined", () => {
    const { queryByTestId } = render(
      <BuildingInfoModal
        visible={true}
        onClose={mockOnClose}
        selectedBuilding={null}
        onNavigate={mockNavigate}
        testID="building-info-modal"
        onUseAsOrigin={mockUseAsOrigin}
      />
    );
  
    expect(queryByTestId("building-info-modal-close-button")).toBeNull();
    expect(queryByTestId("building-info-modal-building-image")).toBeNull();
  
    const { queryByTestId: queryByTestIdUndefined } = render(
      <BuildingInfoModal
        visible={true}
        onClose={mockOnClose}
        selectedBuilding={undefined}
        onNavigate={mockNavigate}
        testID="building-info-modal"
        onUseAsOrigin={mockUseAsOrigin}
      />
    );
  
    expect(queryByTestIdUndefined("building-info-modal-close-button")).toBeNull();
    expect(queryByTestIdUndefined("building-info-modal-building-image")).toBeNull();
  });
});
