import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomMarker from "../CustomMarker";

describe("CustomMarker", () => {
  const coordinate = { latitude: 12.34, longitude: 56.78 };
  const testID = "test-marker";

  it("renders default marker when no markerType is provided", () => {
    const { getByTestId, queryByTestId } = render(
      <CustomMarker coordinate={coordinate} testID={testID} />
    );
    expect(getByTestId(`${testID}-marker`)).toBeTruthy();
    expect(getByTestId(`${testID}-default-marker`)).toBeTruthy();
    expect(queryByTestId(`${testID}-restaurant-marker`)).toBeNull();
    expect(queryByTestId(`${testID}-cafe-marker`)).toBeNull();
    expect(queryByTestId(`${testID}-washroom-marker`)).toBeNull();
  });

  it("renders restaurant marker when markerType is 'restaurant'", () => {
    const { getByTestId, queryByTestId } = render(
      <CustomMarker coordinate={coordinate} testID={testID} markerType="restaurant" />
    );
    expect(getByTestId(`${testID}-marker`)).toBeTruthy();
    expect(getByTestId(`${testID}-restaurant-marker`)).toBeTruthy();
    expect(queryByTestId(`${testID}-default-marker`)).toBeNull();
    expect(queryByTestId(`${testID}-cafe-marker`)).toBeNull();
    expect(queryByTestId(`${testID}-washroom-marker`)).toBeNull();
  });

  it("calls onPress when marker is pressed", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <CustomMarker coordinate={coordinate} testID={testID} onPress={onPressMock} />
    );
    fireEvent.press(getByTestId(`${testID}-marker`));
    expect(onPressMock).toHaveBeenCalled();
  });
});