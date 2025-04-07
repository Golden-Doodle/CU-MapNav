import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import CompleteDistanceMatrixChunked from "../MultiStopPlanner";
import * as Location from "expo-location";
import { fetchTodaysEventsFromSelectedSchedule } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";
import { fetchNearbyPlaces } from "@/app/services/GoogleMap/googlePlacesService";

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock the expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
  })),
}));

// Mock the location services
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock the calendar service
jest.mock("@/app/services/GoogleCalendar/fetchingUserCalendarData", () => ({
  fetchTodaysEventsFromSelectedSchedule: jest.fn(),
}));

// Mock the places service
jest.mock("@/app/services/GoogleMap/googlePlacesService", () => ({
  fetchNearbyPlaces: jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn();

// Mock Alert
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.Alert.alert = jest.fn();
  return RN;
});

describe("CompleteDistanceMatrixChunked", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: {
        latitude: 45.495,
        longitude: -73.578,
      },
    });
    (fetchTodaysEventsFromSelectedSchedule as jest.Mock).mockResolvedValue([
      {
        id: "event1",
        summary: "Math Class",
        start: { dateTime: "2023-01-01T10:00:00" },
        location: JSON.stringify({ building: "Hall Building" }),
      },
    ]);
    (fetchNearbyPlaces as jest.Mock).mockResolvedValue([
      {
        place_id: "place1",
        name: "Coffee Shop",
        geometry: {
          location: { lat: 45.496, lng: -73.579 },
        },
      },
    ]);
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("maps.googleapis.com/maps/api/distancematrix/json")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              status: "OK",
              rows: [
                {
                  elements: [
                    { status: "OK", distance: { value: 100 } },
                    { status: "OK", distance: { value: 200 } },
                  ],
                },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unexpected URL"));
    });
  });

  // ... other tests ...

  it("toggles categories correctly", async () => {
    const { getByText, getByTestId, queryByText } = render(<CompleteDistanceMatrixChunked />);

    await waitFor(() => {
      expect(getByText("Select Categories: None selected")).toBeTruthy();
    });

    // Open dropdown
    fireEvent.press(getByText("Select Categories: None selected"));

    // Wait for dropdown to open and render options
    await waitFor(() => {
      expect(getByText("cafe")).toBeTruthy();
    });

    // Toggle the category
    fireEvent.press(getByTestId("category-dropdown"));

   await waitFor(() => {
     expect(getByTestId("category-dropdown")).toBeTruthy();
   });

    // Toggle it off - need to reopen dropdown
    fireEvent.press(getByTestId("category-dropdown"));
    fireEvent.press(getByText("cafe"));

    await waitFor(() => {
      expect(queryByText("Select Categories: cafe")).toBeFalsy();
    });
  });

  it("changes start location", async () => {
    const { getByText } = render(<CompleteDistanceMatrixChunked />);

    await waitFor(() => {
      expect(getByText("Start Location: My Location (Start)")).toBeTruthy();
    });

    // Open start location dropdown
    fireEvent.press(getByText("Start Location: My Location (Start)"));

    // Find the Math Class option in the dropdown
    const mathClassOption = getByText("Math Class");

    // Select it
    fireEvent.press(mathClassOption);

    await waitFor(() => {
      expect(getByText("Start Location: Math Class")).toBeTruthy();
    });
  });

  it("shows alert when not enough tasks are selected for route", async () => {
    const { getByText } = render(<CompleteDistanceMatrixChunked />);

    await waitFor(() => {
      expect(getByText("Build Best Route (TSP)")).toBeTruthy();
    });

    fireEvent.press(getByText("Build Best Route (TSP)"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Select at least 2 tasks (including your start)!");
    });
  });

  it("handles API errors when building route", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("API error"))
    );

    const { getByText, getAllByRole } = render(<CompleteDistanceMatrixChunked />);

    await waitFor(() => {
      expect(getByText("Math Class")).toBeTruthy();
    });

    const switches = getAllByRole("switch");
    fireEvent(switches[0], "valueChange", true);
    fireEvent(switches[1], "valueChange", true);

    fireEvent.press(getByText("Build Best Route (TSP)"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Failed to build route");
    });
  });
});
