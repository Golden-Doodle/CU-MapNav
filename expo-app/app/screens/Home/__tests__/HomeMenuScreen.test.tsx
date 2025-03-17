import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import HomeMenuScreen from "../HomeMenuScreen";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("HomeMenuScreen", () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  it("renders all elements correctly", () => {
    const { getByTestId, getByText } = render(<HomeMenuScreen />);

    expect(getByTestId("back-button")).toBeTruthy();

    expect(getByTestId("menu-title")).toHaveTextContent("Menu");

    expect(getByTestId("campus-map-button")).toBeTruthy();
    expect(getByTestId("chatbot-button")).toBeTruthy();
    expect(getByTestId("shuttle-button")).toBeTruthy();
    expect(getByTestId("study-spots-button")).toBeTruthy();

    expect(getByText("📍 Campus Map")).toBeTruthy();
    expect(getByText("💬 Chatbot")).toBeTruthy();
    expect(getByText("🚌 Shuttle Schedule")).toBeTruthy();
    expect(getByText("📖 Study Spots")).toBeTruthy();
  });

  it("calls router.back() when Back button is pressed", () => {
    const { getByTestId } = render(<HomeMenuScreen />);

    fireEvent.press(getByTestId("back-button"));

    expect(mockBack).toHaveBeenCalled();
  });

  it("calls router.push() when a menu item is pressed", () => {
    const { getByTestId } = render(<HomeMenuScreen />);

    fireEvent.press(getByTestId("campus-map-button"));
    expect(mockPush).toHaveBeenCalledWith("/screens/Home/CampusMapScreen");

    fireEvent.press(getByTestId("chatbot-button"));
    expect(mockPush).toHaveBeenCalledWith("/screens/Chatbot/ChatBotScreen");

    fireEvent.press(getByTestId("shuttle-button"));
    expect(mockPush).toHaveBeenCalledWith("/screens/Shuttle/ShuttleScreen");

    fireEvent.press(getByTestId("study-spots-button"));
    expect(mockPush).toHaveBeenCalledWith("/screens/StudySpots/StudySpotScreen");
  });
});