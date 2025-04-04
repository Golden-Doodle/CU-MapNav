import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import SettingsScreen from "../SettingsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const mockSignOut = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("@microsoft/react-native-clarity", () => ({
  intialize: jest.fn(),
  pause: jest.fn(), 
  isPaused: jest.fn(),
  resume: jest.fn(), 
  getCurrentSessionUrl: jest.fn(), 
  sendCustomEvent: jest.fn(),
}))

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock("@react-native-firebase/auth", () => ({
  __esModule: true,
  default: () => ({
    signOut: mockSignOut, 
  }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock("react-i18next", () => ({
  __esModule: true,
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn().mockResolvedValue(null),
    },
  }),
  initReactI18next: {
    type: "backend",
    init: jest.fn(),
  },
}));

jest.mock("i18next", () => ({
  __esModule: true,
  default: {
    changeLanguage: jest.fn().mockResolvedValue(null),
    t: jest.fn((key) => key),
    language: "en",
    init: jest.fn(),
  },
}));

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs out user when logout button is pressed", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    fireEvent.press(getByTestId("logout-button"));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    await waitFor(() => expect(AsyncStorage.clear).toHaveBeenCalled());
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
  });

  it("handles error when loading settings from AsyncStorage", async () => {
    const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "notifications") {
        return Promise.reject(new Error("AsyncStorage error"));
      }
      return Promise.resolve(null);
    });

    render(<SettingsScreen />);
    await act(async () => Promise.resolve());

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith("Error loading settings:", expect.any(Error));
    });

    mockConsoleError.mockRestore();
  });

  it("navigates to schedule screen when schedule button is pressed", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    fireEvent.press(getByTestId("schedule-button"));
    expect(mockPush).toHaveBeenCalledWith("/screens/Settings/ScheduleScreen");
  });

  it("toggles notifications switch and saves setting", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    const switchElement = getByTestId("notifications-switch");
    fireEvent(switchElement, "valueChange", true);
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith("notifications", "true"));
  });

  it("toggles dark mode switch and saves setting", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    const switchElement = getByTestId("dark-mode-switch");
    fireEvent(switchElement, "valueChange", true);
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith("darkMode", "true"));
  });

  it("navigates to account settings screen when account details button is pressed", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    fireEvent.press(getByTestId("account-details-button"));
    expect(mockPush).toHaveBeenCalledWith("/screens/Settings/AccountSettingsScreen");
  });

  it("navigates to support screen when support button is pressed", async () => {
    const { getByTestId } = render(<SettingsScreen />);
    fireEvent.press(getByTestId("support-button"));
    expect(mockPush).toHaveBeenCalledWith("/screens/Settings/SupportScreen");
  });

  it("loads saved notification, dark mode and usability testing mode settings from AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "notifications") return Promise.resolve("true");
      if (key === "darkMode") return Promise.resolve("false");
      if (key === "utMode") return Promise.resolve("false");
      return Promise.resolve(null);
    });

    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByTestId("notifications-switch").props.value).toBe(true);
      expect(getByTestId("dark-mode-switch").props.value).toBe(false);
      expect(getByTestId("usability-testing-switch").props.value).toBe(false);
    });
  });

  it("logs 'Delete Account' when delete account button is pressed", () => {
    const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByTestId } = render(<SettingsScreen />);
    fireEvent.press(getByTestId("delete-account-button"));
    expect(mockConsoleLog).toHaveBeenCalledWith("Delete Account");
    mockConsoleLog.mockRestore();
  });

  it("toggles the usability testing mode switch and saves setting", async () => {
      const { getByTestId } = render(<SettingsScreen />);
      const switchElement = getByTestId("usability-testing-switch");
      
      fireEvent(switchElement, "valueChange", true);
      fireEvent(switchElement, "valueChange", false);

      await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith("utMode","true"));
      await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith("utMode","false"));
  });

});
