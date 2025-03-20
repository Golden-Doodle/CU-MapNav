import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import IndoorNavigationHeader from "../IndoorNavigationHeader";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe("IndoorNavigationHeader", () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it("renders correctly with the proper texts and testIDs", () => {
    const { getByTestId } = render(
      <IndoorNavigationHeader testID="headerComponent" />
    );

    expect(getByTestId("headerComponent")).toBeTruthy();
    expect(getByTestId("backButton")).toBeTruthy();
    expect(getByTestId("headerTitle").props.children).toBe("Indoor Navigation");
    expect(getByTestId("infoContainer")).toBeTruthy();
    expect(getByTestId("infoText").props.children).toBe("Find your way inside");
  });

  it("calls router.back when the back button is pressed", () => {
    const { getByTestId } = render(
      <IndoorNavigationHeader testID="headerComponent" />
    );

    fireEvent.press(getByTestId("backButton"));
    expect(mockBack).toHaveBeenCalled();
  });
});