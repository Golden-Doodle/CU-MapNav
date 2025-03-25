import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FilterModal, { defaultFilters } from "../FilterModal";

describe("FilterModal", () => {
  const onApplyMock = jest.fn();
  const onCloseMock = jest.fn();

  const renderComponent = (visible: boolean) =>
    render(
      <FilterModal visible={visible} onApply={onApplyMock} onClose={onCloseMock} />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the modal when visible is true", () => {
    const { getByTestId, getByText } = renderComponent(true);

    expect(getByTestId("filter-modal-container")).toBeTruthy();
    expect(getByTestId("filter-modal-title")).toBeTruthy();
    expect(getByText("Filter Places")).toBeTruthy();
  });

  it("does not render the modal when visible is false", () => {
    const { queryByTestId } = renderComponent(false);

    expect(queryByTestId("filter-modal-background")).toBeNull();
  });

  it("renders all available filter rows with default selected values", () => {
    const { getByTestId } = renderComponent(true);

    defaultFilters.forEach((filterKey) => {
      const switchElement = getByTestId(`filter-modal-switch-${filterKey}`);
      expect(switchElement.props.value).toBe(true);
    });
  });

  it("toggles a filter switch when pressed", async () => {
    const { getByTestId } = renderComponent(true);

    const restaurantSwitch = getByTestId("filter-modal-switch-restaurant");
    expect(restaurantSwitch.props.value).toBe(true);

    fireEvent(restaurantSwitch, "valueChange", false);
    await waitFor(() => {
      expect(getByTestId("filter-modal-switch-restaurant").props.value).toBe(false);
    });

    fireEvent(restaurantSwitch, "valueChange", true);
    await waitFor(() => {
      expect(getByTestId("filter-modal-switch-restaurant").props.value).toBe(true);
    });
  });

  it("calls onApply with the selected filters when Apply button is pressed", async () => {
    const { getByTestId } = renderComponent(true);

    const restaurantSwitch = getByTestId("filter-modal-switch-restaurant");
    fireEvent(restaurantSwitch, "valueChange", false);

    const applyButton = getByTestId("filter-modal-apply-button");
    fireEvent.press(applyButton);

    await waitFor(() => {
      expect(onApplyMock).toHaveBeenCalledWith(["cafe", "washroom"]);
    });
  });

  it("calls onClose when Cancel button is pressed", async () => {
    const { getByTestId } = renderComponent(true);

    const cancelButton = getByTestId("filter-modal-cancel-button");
    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
    });
  });
});