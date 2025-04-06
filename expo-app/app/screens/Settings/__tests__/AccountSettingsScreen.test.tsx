import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import { AuthContext } from "../../../contexts/AuthContext";
import AccountSettingsScreen from "../AccountSettingsScreen";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

// Mocks for necessary modules
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    signOut: jest.fn(),
    revokeAccess: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn(),
    getTokens: jest.fn().mockResolvedValue({
      idToken: "test-id-token",
      accessToken: "test-access-token",
    }),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("@react-native-firebase/auth", () => ({
  default: {
    signOut: jest.fn(),
    GoogleAuthProvider: {
      credential: jest.fn(),
    },
  },
  FirebaseAuthTypes: {},
}));

jest.mock("expo-image-picker", () => ({
  ...jest.requireActual("expo-image-picker"),
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  launchImageLibraryAsync: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe("AccountSettingsScreen", () => {
  let mockAuthContext: any;

  beforeEach(() => {
    mockAuthContext = {
      user: {
        uid: "test-uid",
        email: "test@example.com",
        photoURL: "https://example.com/photo.jpg",
        displayName: "Test User",
        emailVerified: true,
        isAnonymous: false,
        providerId: "google.com",
        phoneNumber: "123-456-7890",
        providerData: [],
        metadata: {
          creationTime: "1234567890",
          lastSignInTime: "1234567890",
        },
        multiFactor: {},
        refreshToken: "test-refresh-token",
        toJSON: jest.fn().mockReturnValue({ email: "test@example.com" }),
      },
      setUser: jest.fn(),
      loading: false,
      signOut: jest.fn(),
      handleGoogleSignIn: jest.fn(),
      handleSignInAsGuest: jest.fn(),
      googleCalendarEvents: [],
      selectedCalendarId: null,
      setSelectedCalendarId: jest.fn(),
    };
  });

  it("renders correctly", () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <AccountSettingsScreen />
      </AuthContext.Provider>
    );

    expect(getByTestId("header")).toBeTruthy();
    expect(getByTestId("profile-image")).toBeTruthy();

    const emailInput = getByTestId("input-email");
    expect(emailInput.props.value).toBe("test@example.com");
  });

  it("handles save changes button press", async () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <AccountSettingsScreen />
      </AuthContext.Provider>
    );

    const saveButton = getByTestId("save-button");
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByTestId("save-button")).toBeDisabled();
    });
  });

  it("opens image picker and updates photo", async () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <AccountSettingsScreen />
      </AuthContext.Provider>
    );

    const pickImageButton = getByTestId("edit-photo-button");
    fireEvent.press(pickImageButton);

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "https://example.com/photo.jpg" }],
    });

    await waitFor(() => {
      expect(getByTestId("profile-image").props.source.uri).toBe(
        "https://example.com/photo.jpg"
      );
    });
  });

  it("displays modal when editing a field", async () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <AccountSettingsScreen />
      </AuthContext.Provider>
    );

    const editNameButton = getByTestId("edit-name");
    fireEvent.press(editNameButton);

    await waitFor(() => {
      const modal = getByTestId("modal-container");
      expect(modal).toBeTruthy();
    });

    const modalInput = getByTestId("modal-input");
    expect(modalInput.props.value).toBe("Johnny Woodstorm");
  });

  it("edits profile field and saves changes", () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <AccountSettingsScreen />
      </AuthContext.Provider>
    );

    const editNameButton = getByTestId("edit-name");
    fireEvent.press(editNameButton);

    const modalInput = getByTestId("modal-input");
    fireEvent.changeText(modalInput, "New Name");

    const saveButton = getByTestId("save-edit-button");
    fireEvent.press(saveButton);

    expect(getByTestId("input-name").props.value).toBe("New Name");
  });

  it("handles no schedules found scenario", async () => {
    const mockAuthContextNoSchedules = {
      ...mockAuthContext,
      selectedCalendarId: null,
    };

    const { queryByText } = render(
      <AuthContext.Provider value={mockAuthContextNoSchedules}>
        <AccountSettingsScreen />
      </AuthContext.Provider>
    );

    expect(queryByText("No schedules found")).toBeTruthy();
  });

  it("resets profile image when image picker is canceled", async () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <AccountSettingsScreen />
      </AuthContext.Provider>
    );

    const initialProfileImage = getByTestId("profile-image").props.source.uri;

    const pickImageButton = getByTestId("edit-photo-button");
    fireEvent.press(pickImageButton);

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: true,
      assets: [],
    });

    await waitFor(() => {
      expect(getByTestId("profile-image").props.source.uri).toBe(
        initialProfileImage
      );
    });
  });

  it("opens profile modal for editing and cancels correctly", async () => {
    const { getByTestId, queryByTestId } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <AccountSettingsScreen />
      </AuthContext.Provider>
    );

    const editNameButton = getByTestId("edit-name");
    fireEvent.press(editNameButton);

    const modal = getByTestId("modal-container");
    expect(modal).toBeTruthy();

    const cancelButton = getByTestId("cancel-button");
    fireEvent.press(cancelButton);

    expect(queryByTestId("modal-container")).toBeNull();
  });

  // ** Needs to be updated later when implementation is done **
  it("selects a schedule and saves the changes", async () => {
    const mockSchedules = [
      { id: "1", summary: "Work Schedule" },
      { id: "2", summary: "School Schedule" },
    ];

    jest
      .spyOn(
        require("@/app/services/GoogleCalendar/fetchingUserCalendarData"),
        "fetchAllCalendars"
      )
      .mockResolvedValue(mockSchedules);

    const mockAuthContextWithSchedules = {
      ...mockAuthContext,
      selectedCalendarId: null,
      setSelectedCalendarId: jest.fn(),
    };

    const { getByTestId, getByText } = render(
      <AuthContext.Provider value={mockAuthContextWithSchedules}>
        <AccountSettingsScreen />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(getByText("Work Schedule")).toBeTruthy();
      expect(getByText("School Schedule")).toBeTruthy();
    });

    const scheduleSwitch1 = getByTestId("switch-1");
    fireEvent(scheduleSwitch1, "valueChange", true);

    const saveButton = getByTestId("save-button");
    await waitFor(() => {
      expect(saveButton).toHaveStyle({ opacity: 1 });
    });

    fireEvent.press(saveButton);

    console.log(mockAuthContextWithSchedules.setSelectedCalendarId.mock.calls);
  });
});
