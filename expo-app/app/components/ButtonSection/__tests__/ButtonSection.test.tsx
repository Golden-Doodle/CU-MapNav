import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ButtonSection from "../ButtonSection";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("ButtonSection Component", () => {
  it("renders both buttons", () => {
    const { getByText } = render(<ButtonSection />);

    expect(getByText("Study Spot")).toBeTruthy();
    expect(getByText("Coffee Stop")).toBeTruthy();
  });

  it("navigates to CampusMapScreen with correct params on Coffee Stop button press", () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const { getByTestId } = render(<ButtonSection />);
    const coffeeStopButton = getByTestId("coffee-stop-button");

    fireEvent.press(coffeeStopButton);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/screens/Home/CampusMapScreen",
      params: {
        pressedCoffeeStop: "true",
      },
    });
  });
});
