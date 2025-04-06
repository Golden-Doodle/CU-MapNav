import React from "react";
import { render, cleanup, act } from "@testing-library/react-native";
import NextClassComponent from "@/app/components/Header/NextClassComponent";
import { AuthContext } from "@/app/contexts/AuthContext";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useRouter } from "expo-router";

jest.useFakeTimers();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ idToken: "test-id-token" }),
    getTokens: jest.fn().mockResolvedValue({
      idToken: "test-id-token",
      accessToken: "test-access-token",
    }),
    revokeAccess: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock("@react-native-firebase/auth", () => ({
  default: {
    GoogleAuthProvider: {
      credential: jest.fn(),
    },
    signInWithCredential: jest
      .fn()
      .mockResolvedValue({ user: { uid: "1", email: "test@example.com" } }),
    signOut: jest.fn(),
  },
  FirebaseAuthTypes: {},
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

describe("NextClassComponent", () => {
  let mockAuthContext: any;

  beforeEach(() => {
    mockAuthContext = {
      user: null as FirebaseAuthTypes.User | null,
      setUser: jest.fn(),
      signOut: jest.fn(),
      handleGoogleSignIn: jest.fn(),
      handleSignInAsGuest: jest.fn(),
      googleCalendarEvents: [],
      selectedCalendarId: null,
      setSelectedCalendarId: jest.fn(),
      loading: false,
    };
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    cleanup();
    jest.clearAllMocks();
  });

  it("renders correctly when there are no classes and user is not logged in", () => {
    const { getByText } = render(
      <AuthContext.Provider value={{ ...mockAuthContext, user: null }}>
        <NextClassComponent
          calendarEvents={[]}
          nextClass={null}
          setNextClass={() => {}}
          testID="next-class"
        />
      </AuthContext.Provider>
    );
    expect(getByText("Please login to see the next class")).toBeTruthy();
  });

  it("renders correctly when there are no classes and user is logged in", () => {
    const mockUser = {
      uid: "1",
      email: "test@example.com",
    } as FirebaseAuthTypes.User;

    const { getByText } = render(
      <AuthContext.Provider value={{ ...mockAuthContext, user: mockUser }}>
        <NextClassComponent
          calendarEvents={[]}
          nextClass={null}
          setNextClass={() => {}}
          testID="next-class"
        />
      </AuthContext.Provider>
    );
    expect(getByText("No classes scheduled for today.")).toBeTruthy();
  });
});
