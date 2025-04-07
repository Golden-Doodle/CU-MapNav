import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import CompleteDistanceMatrixChunked from "../MultiStopPlanner";

// Mock the router since we call router.back() in the component
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

// Either in your test file or a global setup file like jest-setup.ts
jest.mock("@react-native-google-signin/google-signin", () => {
  return {
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn().mockResolvedValue(true),
      signIn: jest.fn().mockResolvedValue({
        idToken: "fake-id-token",
      }),
      getTokens: jest.fn().mockResolvedValue({
        accessToken: "fake-access-token",
        idToken: "fake-id-token",
      }),
    },
  };
});


// Mock fetch calls for distance matrix
(global.fetch as jest.Mock) = jest.fn(async () =>
  Promise.resolve({
    json: async () => ({
      status: "OK",
      rows: [
        {
          elements: [
            { status: "OK", distance: { value: 1234 } },
            { status: "OK", distance: { value: 2345 } },
          ],
        },
      ],
    }),
  })
);

describe("CompleteDistanceMatrixChunked Component", () => {
  beforeAll(() => {
    // Optional: Silence warnings or set up any global mocks
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test("renders loading initially, then shows main UI", async () => {
    const { getByTestId, queryByTestId, getByText } = render(<CompleteDistanceMatrixChunked />);

    // Should show an ActivityIndicator while loading
    expect(getByTestId("ActivityIndicator")).toBeTruthy();

    // Wait for the loading to finish
    await waitFor(() => {
      // The spinner should be gone; now the main UI is present
      expect(queryByTestId("ActivityIndicator")).toBeNull();
      // Check for main title
      getByText("Chunked Distance Matrix TSP (Choose Start)");
    });
  });

  test("opens category dropdown and toggles a category", async () => {
    const { getByText, queryByText } = render(<CompleteDistanceMatrixChunked />);

    // Wait for initial loading to pass
    await waitFor(() => {
      expect(getByText("Chunked Distance Matrix TSP (Choose Start)")).toBeTruthy();
    });

    // By default the text "Select Categories: None selected" is shown
    const dropdownHeader = getByText(/Select Categories:/i);
    // Press the dropdown
    fireEvent.press(dropdownHeader);

    // Now the category list should appear
    // Example: look for "restaurant"
    expect(getByText("restaurant")).toBeTruthy();
    expect(getByText("cafe")).toBeTruthy();
    expect(getByText("washroom")).toBeTruthy();
    expect(getByText("campus")).toBeTruthy();

    // Tap "restaurant"
    fireEvent.press(getByText("restaurant"));

    // The dropdown should still be open, so we see "restaurant ✓" now
    expect(getByText("restaurant ✓")).toBeTruthy();

    // We can close the dropdown by pressing the header again
    fireEvent.press(dropdownHeader);
    expect(queryByText("restaurant")).toBeNull(); // hidden now
  });

  test("tries to build route with no tasks selected -> shows alert", async () => {
    const { getByText, queryByText } = render(<CompleteDistanceMatrixChunked />);

    await waitFor(() => {
      getByText("Chunked Distance Matrix TSP (Choose Start)");
    });

    // Press "Build Best Route" with no tasks selected
    fireEvent.press(getByText(/Build Best Route/i));

    // We expect an Alert with "Select at least 2 tasks"
    expect(Alert.alert).toHaveBeenCalledWith("Select at least 2 tasks (including your start)!");
  });

  test("selects user location and another task, builds route", async () => {
    const { getByText, queryByText } = render(
      <CompleteDistanceMatrixChunked />
    );

    // Wait for loading to finish
    await waitFor(() => {
      getByText("Chunked Distance Matrix TSP (Choose Start)");
    });

    // The FlatList items won't appear instantly (they're built after init), so let's wait a bit
    await waitFor(() => {
      expect(queryByText("ActivityIndicator")).toBeNull();
      expect(getByText("My Location (Start)")).toBeTruthy();
    });

    // Toggle on "My Location (Start)" & one more
    fireEvent(getByText("My Location (Start)"), "press"); // switch press
    // We'll just assume there's some other item (like an event or building).
    // For test, let's pick the first "Class Event" or "Cafe" if it exists.
    // If not, we can skip. This is just an example.

    // If your test data doesn't automatically have any other tasks, we can forcibly add them.
    // For demonstration, let's assume "Class Event" is found:
    const possibleSecondTask = queryByText("Class Event");
    if (possibleSecondTask) {
      fireEvent.press(possibleSecondTask);
    } else {
      // If your environment doesn't have that event, you might skip or mock your data
      // For demonstration, let's just pass
    }

    // Now click "Build Best Route"
    fireEvent.press(getByText(/Build Best Route/i));

    // Because we have a global fetch mock returning 'OK', we should see route steps
    // Wait for them to appear
    await waitFor(() => {
      // Example: check for "Step 1:" text
      const step1 = getByText(/Step 1:/i);
      expect(step1).toBeTruthy();
      // "Total distance" label
      const totalDist = getByText(/Total distance:/i);
      expect(totalDist).toBeTruthy();
    });
  });
});
