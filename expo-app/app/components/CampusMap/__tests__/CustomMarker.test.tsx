import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomMarker from "../CustomMarker";

describe("CustomMarker", () => {
  const coordinate = { latitude: 12.34, longitude: 56.78 };
  const testID = "test-marker";

  it("renders default marker when isFoodLocation is false", () => {
    const { getByTestId, queryByTestId } = render(
      <CustomMarker coordinate={coordinate} testID={testID} />
    );
    expect(getByTestId(`${testID}-marker`)).toBeTruthy();
    expect(getByTestId(`${testID}-default-marker`)).toBeTruthy();
    expect(queryByTestId(`${testID}-food-marker`)).toBeNull();
  });

  it("renders food marker when isFoodLocation is true", () => {
    const { getByTestId, queryByTestId } = render(
      <CustomMarker coordinate={coordinate} testID={testID} isFoodLocation={true} />
    );
    expect(getByTestId(`${testID}-marker`)).toBeTruthy();
    expect(getByTestId(`${testID}-food-marker`)).toBeTruthy();
    expect(queryByTestId(`${testID}-default-marker`)).toBeNull();
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