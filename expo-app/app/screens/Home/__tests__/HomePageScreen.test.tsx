import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HomePageScreen from "../HomePageScreen"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn((key) => {
      if (key === "selectedCampus") return Promise.resolve("LOY"); 
      return Promise.resolve(null);
    }),
}));

jest.mock("@react-native-firebase/auth", () => ({
    currentUser: { uid: "mock-uid", email: "test@example.com" },
    signInWithEmailAndPassword: jest.fn(() =>
      Promise.resolve({ user: { uid: "mock-uid", email: "test@example.com" } })
    ),
    signOut: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn((callback) => callback({ uid: "mock-uid", email: "test@example.com" })),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn().mockResolvedValue(true),
      signIn: jest.fn().mockResolvedValue({
        idToken: "mock-id-token",
        user: { name: "Test User", email: "test@example.com" },
      }),
      signOut: jest.fn().mockResolvedValue(null),
      isSignedIn: jest.fn().mockResolvedValue(true),
      getCurrentUser: jest.fn().mockResolvedValue({
        idToken: "mock-id-token",
        user: { name: "Test User", email: "test@example.com" },
      }),
    },
}));

jest.mock("@/app/services/GoogleCalendar/fetchingUserCalendarData", () => ({
    fetchGoogleCalendarEvents: jest.fn(() =>
      Promise.resolve([
        {
          id: "1",
          summary: "Mock Event",
          start: { dateTime: "2025-02-24T10:00:00Z" },
          end: { dateTime: "2025-02-24T11:00:00Z" },
        },
      ])
    ),
}));

jest.mock("../../../components/Header/Header", () => {
    const { View } = require("react-native");
    return () => <View testID="header-component" />;
});

jest.mock("../../../components/ButtonSection/ButtonSection", () => {
    const { View } = require("react-native");
    return () => <View testID="button-section" />;
});

jest.mock("../../../components/SearchBar/SearchBar", () => {
    const { View } = require("react-native");
    return () => <View testID="search-bar" />;
});

jest.mock("../../../components/QuickShortcuts/QuickShortcuts", () => {
    const { View } = require("react-native");
    return () => <View testID="quick-shortcuts" />;
});

jest.mock("../../../components/HottestSpots/HottestSpots", () => {
    const { View } = require("react-native");
    return () => <View testID="hottest-spots" />;
});

jest.mock("../../../components/ShuttleSchedule/ShuttleSchedule", () => {
    const { View } = require("react-native");
    return ({ route }: { route: string }) => <View testID="shuttle-schedule" data-route={route} />;
});

jest.mock("../../../components/BottomNavigation/BottomNavigation", () => {
    const { View } = require("react-native");
    return () => <View testID="bottom-navigation" />;
});

describe("HomePageScreen Component", () => {
  test("renders all main components", async () => {
    const { getByTestId } = render(<HomePageScreen />);

    expect(getByTestId("header-component")).toBeTruthy();
    expect(getByTestId("button-section")).toBeTruthy();
    expect(getByTestId("search-bar")).toBeTruthy();
    expect(getByTestId("quick-shortcuts")).toBeTruthy();
    expect(getByTestId("hottest-spots")).toBeTruthy();
    expect(getByTestId("shuttle-schedule")).toBeTruthy();
    expect(getByTestId("bottom-navigation")).toBeTruthy();
  });

  test("toggles campus switch and updates AsyncStorage", async () => {
    const { getByRole, getByTestId } = render(<HomePageScreen />);
  
    const switchButton = getByRole("switch");
    fireEvent(switchButton, "valueChange", true); 
  
    await waitFor(() => {
      expect(getByTestId("shuttle-schedule").props["data-route"]).toBe("LOY");
    });
  
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCampus", "LOY");
  });

  test("loads stored campus selection from AsyncStorage on mount", async () => {
    const { getByTestId } = render(<HomePageScreen />);
    
    await waitFor(() => {
      expect(getByTestId("shuttle-schedule").props["data-route"]).toBe("LOY");
    });
    
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("selectedCampus");
  });
});
