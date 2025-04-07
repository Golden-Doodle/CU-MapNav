import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import CompleteDistanceMatrixChunked from "../MultiStopPlanner";
import * as Location from "expo-location";
import { fetchTodaysEventsFromSelectedSchedule } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";
import { fetchNearbyPlaces } from "@/app/services/GoogleMap/googlePlacesService";

jest.spyOn(Alert, "alert");

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
  })),
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock("@/app/services/GoogleCalendar/fetchingUserCalendarData", () => ({
  fetchTodaysEventsFromSelectedSchedule: jest.fn(),
}));

jest.mock("@/app/services/GoogleMap/googlePlacesService", () => ({
  fetchNearbyPlaces: jest.fn(),
}));

global.fetch = jest.fn();

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
      coords: { latitude: 45.495, longitude: -73.578 },
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
        geometry: { location: { lat: 45.496, lng: -73.579 } },
      },
    ]);

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
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

  it("renders the component and hides the loading indicator", async () => {
    const { queryByTestId, getByTestId } = render(<CompleteDistanceMatrixChunked />);
    expect(queryByTestId("ActivityIndicator")).toBeTruthy();
    await waitFor(() => {
      expect(getByTestId("generic-header")).toBeTruthy();
    });
  });

  it("uses fallback coordinates if location permission denied", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "denied",
    });
    const { getByTestId } = render(<CompleteDistanceMatrixChunked />);
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Location permission not granted; using fallback coords"
      );
      expect(getByTestId("generic-header")).toBeTruthy();
    });
  });

  it("toggles category dropdown and selects categories", async () => {
    const { getByTestId, findByText } = render(<CompleteDistanceMatrixChunked />);
  
    // Wait until dropdown can be opened
    await waitFor(() => {
      fireEvent.press(getByTestId("category-dropdown"));
    });
  
    const cafeOption = await findByText("cafe");
    const restaurantOption = await findByText("restaurant");
  
    fireEvent.press(cafeOption);
    fireEvent.press(restaurantOption);
  
    // Wait for one or more fetchNearbyPlaces calls (allowing async state update)
    await waitFor(() => {
      expect(fetchNearbyPlaces).toHaveBeenCalled();
    });
  });
  
  it("resets places if only 'campus' category is selected", async () => {
    const { getByTestId, getByText, queryByText } = render(<CompleteDistanceMatrixChunked />);
    await waitFor(() => {
      fireEvent.press(getByTestId("category-dropdown"));
      fireEvent.press(getByText("campus"));
    });

    await waitFor(() => {
      expect(queryByText("campus ✓")).toBeTruthy();
    });
  });

  it("changes start location", async () => {
    const { getByText, getByTestId } = render(<CompleteDistanceMatrixChunked />);
    await waitFor(() => {
      expect(getByText("Start Location: My Location (Start)")).toBeTruthy();
    });
    fireEvent.press(getByText("Start Location: My Location (Start)"));
    const mathClassOption = await waitFor(() => getByTestId("start-option-event1"));
    fireEvent.press(mathClassOption);
    await waitFor(() => {
      expect(getByText("Start Location: Math Class")).toBeTruthy();
    });
  });

  it("shows alert when not enough tasks are selected", async () => {
    const { getByText } = render(<CompleteDistanceMatrixChunked />);
    await waitFor(() => {
      fireEvent.press(getByText("Build Best Route (TSP)"));
    });
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Select at least 2 tasks (including your start)!"
      );
    });
  });

  it("handles API errors when building route", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("API error"))
    );
    const { getByText, getAllByRole } = render(<CompleteDistanceMatrixChunked />);
    await waitFor(() => {
      const switches = getAllByRole("switch");
      fireEvent(switches[0], "valueChange", true);
      fireEvent(switches[1], "valueChange", true);
      fireEvent.press(getByText("Build Best Route (TSP)"));
    });
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Failed to build route");
    });
  });

  it("builds route and shows modal with steps", async () => {
    const { getByText, getByTestId, queryByTestId, getAllByRole } = render(
      <CompleteDistanceMatrixChunked />
    );
    await waitFor(() => {
      const switches = getAllByRole("switch");
      fireEvent(switches[0], "valueChange", true);
      fireEvent(switches[1], "valueChange", true);
      fireEvent.press(getByText("Build Best Route (TSP)"));
    });

    await waitFor(() => {
      expect(getByTestId("list-modal")).toBeTruthy();
    });

    expect(getByTestId("route-steps-list")).toBeTruthy();

    fireEvent.press(getByTestId("close-button"));
    await waitFor(() => {
      expect(queryByTestId("list-modal")).toBeNull();
    });
  });

  it("toggles a task's selection state", async () => {
    const { getAllByRole } = render(<CompleteDistanceMatrixChunked />);
    await waitFor(() => {
      const switches = getAllByRole("switch");
      fireEvent(switches[0], "valueChange", true);
      fireEvent(switches[0], "valueChange", false);
    });
  });
});
