import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import StudySpots from "../StudySpotScreen";
import * as Router from "expo-router";

// Mock the useRouter hook properly
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("StudySpots", () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    (Router.useRouter as jest.Mock).mockReturnValue({ back: mockBack });
  });

  it("renders correctly", () => {
    const { getByTestId } = render(<StudySpots />);

    expect(getByTestId("study-spots-container")).toBeTruthy();
    expect(getByTestId("study-spots-title")).toHaveTextContent("Study Spots");
    expect(getByTestId("study-spots-info-text")).toHaveTextContent(
      "Nearby study spots will be displayed here."
    );
    expect(getByTestId("back-button")).toBeTruthy();
  });

  it("calls router.back() when Back button is pressed", () => {
    const { getByTestId } = render(<StudySpots />);

    fireEvent.press(getByTestId("back-button"));

    expect(mockBack).toHaveBeenCalled();
  });
});
