import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RadiusAdjuster from "../RadiusAdjuster";

describe("RadiusAdjuster Component", () => {
  const initialValue = 500;
  const onApplyMock = jest.fn();
  const onResetMock = jest.fn();
  const onCloseMock = jest.fn();

  const renderComponent = (propsOverrides = {}) => {
    return render(
      <RadiusAdjuster
        visible={true}
        initialValue={initialValue}
        onApply={onApplyMock}
        onReset={onResetMock}
        onClose={onCloseMock}
        {...propsOverrides}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal when visible is true", () => {
    const { getByTestId, getByText } = renderComponent();
    expect(getByTestId("radius-adjuster-modal-overlay")).toBeTruthy();
    expect(getByTestId("radius-adjuster-modal-container")).toBeTruthy();
    expect(getByTestId("radius-adjuster-title-text")).toBeTruthy();
    expect(getByText("Set Search Radius")).toBeTruthy();
    expect(getByTestId("radius-adjuster-radius-text")).toHaveTextContent(`${initialValue} meters`);
  });

  it("does not render when visible is false", () => {
    const { queryByTestId } = renderComponent({ visible: false });
    expect(queryByTestId("radius-adjuster-modal-overlay")).toBeNull();
  });

  it("updates displayed radius when slider value changes", () => {
    const { getByTestId, getByText } = renderComponent();
    const slider = getByTestId("radius-adjuster-radius-slider");
    fireEvent(slider, "valueChange", 750);
    expect(getByTestId("radius-adjuster-radius-text")).toHaveTextContent("750 meters");
    expect(getByText("750 meters")).toBeTruthy();
  });

  it("resets radius and calls onReset when reset button is pressed", () => {
    const { getByTestId, getByText } = renderComponent();
    const slider = getByTestId("radius-adjuster-radius-slider");

    fireEvent(slider, "valueChange", 1000);
    expect(getByText("1000 meters")).toBeTruthy();

    const resetButton = getByTestId("radius-adjuster-reset-button");
    fireEvent.press(resetButton);

    expect(getByTestId("radius-adjuster-radius-text")).toHaveTextContent("100 meters");
    expect(onResetMock).toHaveBeenCalledTimes(1);
  });

  it("applies the selected radius and calls onClose when apply button is pressed", () => {
    const { getByTestId, getByText } = renderComponent();
    const slider = getByTestId("radius-adjuster-radius-slider");

    fireEvent(slider, "valueChange", 800);
    expect(getByText("800 meters")).toBeTruthy();

    const applyButton = getByTestId("radius-adjuster-apply-button");
    fireEvent.press(applyButton);

    expect(onApplyMock).toHaveBeenCalledWith(800);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is pressed", () => {
    const { getByTestId } = renderComponent();
    const closeButton = getByTestId("radius-adjuster-close-button");
    fireEvent.press(closeButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("updates radius when initialValue prop changes", () => {
    const { getByTestId, getByText, rerender } = renderComponent();
    expect(getByText("500 meters")).toBeTruthy();

    rerender(
      <RadiusAdjuster
        visible={true}
        initialValue={1000}
        onApply={onApplyMock}
        onReset={onResetMock}
        onClose={onCloseMock}
      />
    );
    expect(getByTestId("radius-adjuster-radius-text")).toHaveTextContent("1000 meters");
    expect(getByText("1000 meters")).toBeTruthy();
  });
});