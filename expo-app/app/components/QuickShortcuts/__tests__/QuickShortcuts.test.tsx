import React from "react";
import { render } from "@testing-library/react-native";
import QuickShortcuts from "../QuickShortcuts";

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
});
