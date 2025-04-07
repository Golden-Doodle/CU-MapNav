// ListModal.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ListModal from "../ListModal";

describe("ListModal Component", () => {
  const sampleRouteSteps = [
    "Step 1: A -> B, 100m",
    "Step 2: B -> C, 150m",
    "Total distance: 250m",
  ];
  const onCloseMock = jest.fn();

  it("renders correctly when visible", () => {
    const { getByTestId, queryAllByTestId } = render(
      <ListModal visible={true} onClose={onCloseMock} routeSteps={sampleRouteSteps} />
    );

    // Check that modal and key elements are rendered
    expect(getByTestId("list-modal")).toBeTruthy();
    expect(getByTestId("modal-background")).toBeTruthy();
    expect(getByTestId("modal-container")).toBeTruthy();
    expect(getByTestId("modal-title").props.children).toEqual("Optimized Route");

    // Check that all route steps are rendered
    const routeStepItems = queryAllByTestId("route-step");
    expect(routeStepItems.length).toBe(sampleRouteSteps.length);
    sampleRouteSteps.forEach((step, index) => {
      expect(routeStepItems[index].props.children).toEqual(step);
    });
  });

  it("does not render modal content when not visible", () => {
    const { queryByTestId } = render(
      <ListModal visible={false} onClose={onCloseMock} routeSteps={sampleRouteSteps} />
    );

    // The modal should not be in the tree when not visible
    expect(queryByTestId("list-modal")).toBeNull();
  });

  it("calls onClose when the close button is pressed", () => {
    const { getByTestId } = render(
      <ListModal visible={true} onClose={onCloseMock} routeSteps={sampleRouteSteps} />
    );

    // Simulate a press on the close button
    fireEvent.press(getByTestId("close-button"));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
