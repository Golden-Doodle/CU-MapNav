import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ServicesScreen from "../ServicesScreen";

describe("ServicesScreen", () => {
  it("renders the header, services list, and bottom navigation", () => {
    const { getByTestId } = render(<ServicesScreen />);
    expect(getByTestId("services-header")).toBeTruthy();
    expect(getByTestId("services-list")).toBeTruthy();
    expect(getByTestId("bottom-navigation")).toBeTruthy();
  });

  it("renders the Library button with correct text", () => {
    const { getByTestId, getByText } = render(<ServicesScreen />);
    const libraryButton = getByTestId("library-button");
    expect(libraryButton).toBeTruthy();
    expect(getByText("Library")).toBeTruthy();
  });

  it("calls console.log with 'Library pressed' when Library button is pressed", () => {
    const consoleLogSpy = jest.spyOn(console, "log");
    const { getByTestId } = render(<ServicesScreen />);
    const libraryButton = getByTestId("library-button");
    fireEvent.press(libraryButton);
    expect(consoleLogSpy).toHaveBeenCalledWith("Library pressed");
    consoleLogSpy.mockRestore();
  });

  it("renders the Emergency Services button with correct text", () => {
    const { getByTestId, getByText } = render(<ServicesScreen />);
    const emergencyButton = getByTestId("emergency-button");
    expect(emergencyButton).toBeTruthy();
    expect(getByText("Emergency Services")).toBeTruthy();
  });

  it("calls console.log with 'Emergency Services pressed' when Emergency Services button is pressed", () => {
    const consoleLogSpy = jest.spyOn(console, "log");
    const { getByTestId } = render(<ServicesScreen />);
    const emergencyButton = getByTestId("emergency-button");
    fireEvent.press(emergencyButton);
    expect(consoleLogSpy).toHaveBeenCalledWith("Emergency Services pressed");
    consoleLogSpy.mockRestore();
  });
});
