import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../SettingsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";

const mockSignOut = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

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

  it("handles logout failure and logs an error", async () => {
    mockSignOut.mockRejectedValueOnce(new Error("Logout failed"));
  
    const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  
    const { getByTestId } = render(<SettingsScreen />);
    
    fireEvent.press(getByTestId("logout-button")); 
  
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled()); 
    await waitFor(() => expect(AsyncStorage.clear).not.toHaveBeenCalled()); 
    await waitFor(() => expect(mockReplace).not.toHaveBeenCalled()); 
    await waitFor(() => expect(mockConsoleError).toHaveBeenCalledWith("Logout Error:", expect.any(Error))); 
  
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

  it("loads saved notification and dark mode settings from AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("true"); 
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("false"); 
  
    const { getByTestId } = render(<SettingsScreen />);
  
    await waitFor(() => {
      expect(getByTestId("notifications-switch").props.value).toBe(true);
      expect(getByTestId("dark-mode-switch").props.value).toBe(false);
    });
  });
  
  it("handles error when loading settings from AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error("AsyncStorage error"));
  
    const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  
    render(<SettingsScreen />);
  
    await waitFor(() => 
      expect(mockConsoleError).toHaveBeenCalledWith("Error loading settings:", expect.any(Error))
    );
  
    mockConsoleError.mockRestore(); 
  });

  it("logs 'Delete Account' when delete account button is pressed", () => {
    const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
  
    const { getByTestId } = render(<SettingsScreen />);
    
    fireEvent.press(getByTestId("delete-account-button"));
  
    expect(mockConsoleLog).toHaveBeenCalledWith("Delete Account");
  
    mockConsoleLog.mockRestore(); 
  });
  
});
