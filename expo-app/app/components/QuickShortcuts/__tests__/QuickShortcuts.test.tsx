import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import QuickShortcuts from "../QuickShortcuts";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("QuickShortcuts", () => {
  it("renders all shortcut buttons", () => {
    const { getByTestId } = render(<QuickShortcuts />);

    expect(getByTestId("food-shortcut")).toBeTruthy();
    expect(getByTestId("bathroom-shortcut")).toBeTruthy();
    expect(getByTestId("bar-shortcut")).toBeTruthy();
  });

  it("displays the correct text for each shortcut", () => {
    const { getByText } = render(<QuickShortcuts />);

    expect(getByText("Food")).toBeTruthy();
    expect(getByText("Bathroom")).toBeTruthy();
    expect(getByText("Bar")).toBeTruthy();
  });

  it("displays the correct icons for each shortcut", () => {
    const { getByTestId } = render(<QuickShortcuts />);

    const foodIcon = getByTestId("food-icon");
    const bathroomIcon = getByTestId("bathroom-icon");
    const barIcon = getByTestId("bar-icon");

    expect(foodIcon).toBeTruthy();
    expect(bathroomIcon).toBeTruthy();
    expect(barIcon).toBeTruthy();
  });

  it("navigates to the CampusMapScreen with food parameter when food shortcut is pressed", () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const { getByTestId } = render(<QuickShortcuts />);
    const foodShortcut = getByTestId("food-shortcut");

    fireEvent.press(foodShortcut);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/screens/Home/CampusMapScreen",
      params: {
        pressedFood: "true",
      },
    });
  });
});
