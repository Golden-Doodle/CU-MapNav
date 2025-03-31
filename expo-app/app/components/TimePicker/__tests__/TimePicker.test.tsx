import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TimePicker from "../TimePicker";
import { Platform } from "react-native";

describe("TimePicker Component", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", {
      value: originalPlatform,
    });
  });

  const mockSetSelectedTime = jest.fn();
  const selectedTime = new Date("2023-01-01T12:00:00");

  const renderComponent = () =>
    render(
      <TimePicker
        selectedTime={selectedTime}
        setSelectedTime={mockSetSelectedTime}
        testID="time-picker"
      />
    );

  test("renders correctly", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("time-picker-time-button")).toBeTruthy();
    expect(getByTestId("time-picker-selected-time-text")).toHaveTextContent("12:00 PM");
  });

  test("modal does not open by default", () => {
    const { queryByTestId } = renderComponent();
    expect(queryByTestId("time-picker-time-picker-modal")).toBeNull();
  });

  test("opens modal when time button is pressed (iOS)", () => {
    Object.defineProperty(Platform, "OS", { value: "ios" });
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("time-picker-time-button"));
    expect(getByTestId("time-picker-time-picker-modal")).toBeTruthy();
  });

  test("confirms time selection on iOS", () => {
    Object.defineProperty(Platform, "OS", { value: "ios" });
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("time-picker-time-button"));
    fireEvent.press(getByTestId("time-picker-confirm-button"));

    expect(mockSetSelectedTime).toHaveBeenCalled();
  });

  test("modal closes when done is pressed (iOS)", () => {
    Object.defineProperty(Platform, "OS", { value: "ios" });
    const { getByTestId, queryByTestId } = renderComponent();

    fireEvent.press(getByTestId("time-picker-time-button"));
    fireEvent.press(getByTestId("time-picker-confirm-button"));
    expect(queryByTestId("time-picker-time-picker-modal")).toBeNull();
  });
  
  test("updates selected time on Android when new time picked", () => {
    Object.defineProperty(Platform, "OS", { value: "android" });
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("time-picker-time-button"));
    const newTime = new Date("2023-01-01T13:30:00");
    const dateTimePicker = getByTestId("time-picker-date-time-picker");

    fireEvent(dateTimePicker, "onChange", {
      nativeEvent: { timestamp: newTime.getTime() },
    }, newTime);

    expect(mockSetSelectedTime).toHaveBeenCalledWith(newTime);
  });

  test("updates tempTime on iOS when time changes", () => {
    Object.defineProperty(Platform, "OS", { value: "ios" });
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("time-picker-time-button"));
    const newTime = new Date("2023-01-01T14:45:00");
    const dateTimePicker = getByTestId("time-picker-date-time-picker");

    fireEvent(dateTimePicker, "onChange", {
      nativeEvent: { timestamp: newTime.getTime() },
    }, newTime);

    fireEvent.press(getByTestId("time-picker-confirm-button"));
    expect(mockSetSelectedTime).toHaveBeenCalledWith(newTime);
  });

  test("reset tempTime to selectedTime on open", () => {
    Object.defineProperty(Platform, "OS", { value: "ios" });
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("time-picker-time-button"));
    fireEvent.press(getByTestId("time-picker-confirm-button"));

    expect(mockSetSelectedTime).toHaveBeenCalledWith(selectedTime);
  });
});
