import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomMarker from "../CustomMarker";

describe("CustomMarker", () => {
  const coordinate = { latitude: 10.0, longitude: 20.0 };
  const mockOnPress = jest.fn();

  it("renders default marker when isFoodLocation is false", () => {
    const { getByTestId } = render(
      <CustomMarker
        coordinate={coordinate}
        title="Sample Location"
        description="Sample Description"
        isFoodLocation={false}
        onPress={mockOnPress}
        testID="custom-marker" 
      />
    );

    const marker = getByTestId("custom-marker-default-marker"); 
    expect(marker).toBeTruthy();
  });

  it("renders food marker when isFoodLocation is true", () => {
    const { getByTestId } = render(
      <CustomMarker
        coordinate={coordinate}
        title="Food Location"
        description="Delicious food here"
        isFoodLocation={true}
        onPress={mockOnPress}
        testID="custom-marker"
      />
    );

    const marker = getByTestId("custom-marker-food-marker"); 
    expect(marker).toBeTruthy();
  });

  it("calls onPress when marker is pressed", () => {
    const { getByTestId } = render(
      <CustomMarker
        coordinate={coordinate}
        title="Sample Location"
        description="Sample Description"
        isFoodLocation={false}
        onPress={mockOnPress}
        testID="custom-marker" 
      />
    );

    fireEvent.press(getByTestId("custom-marker-default-marker")); 
    expect(mockOnPress).toHaveBeenCalled();
  });

  it("renders default marker with correct image source", () => {
    const { getByTestId } = render(
      <CustomMarker
        coordinate={coordinate}
        title="Sample Location"
        description="Sample Description"
        isFoodLocation={false}
        onPress={mockOnPress}
        testID="custom-marker"
      />
    );

    const image = getByTestId("custom-marker-default-marker").props.source.uri; 
    expect(image).toBe("https://maps.google.com/mapfiles/ms/icons/red-dot.png");
  });

  it("renders food marker with correct image source", () => {
    const { getByTestId } = render(
      <CustomMarker
        coordinate={coordinate}
        title="Food Location"
        description="Delicious food here"
        isFoodLocation={true}
        onPress={mockOnPress}
        testID="custom-marker" 
      />
    );

    const image = getByTestId("custom-marker-food-marker").props.source.uri; 
    expect(image).toBe("https://maps.google.com/mapfiles/ms/icons/restaurant.png");
  });
});
