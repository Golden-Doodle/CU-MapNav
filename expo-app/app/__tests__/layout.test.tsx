import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import RootLayout from "../_layout";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { Stack } from "expo-router";

jest.mock("expo-router", () => ({
  Stack: jest.fn(() => null),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ idToken: "test-id-token" }),
    getTokens: jest.fn().mockResolvedValue({ idToken: "test-id-token", accessToken: "test-access-token" }),
    revokeAccess: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock("@react-native-firebase/auth", () => {
  return () => ({
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
    signInWithCredential: jest.fn().mockResolvedValue({
      user: { uid: "1", email: "test@example.com" },
    }),
    signOut: jest.fn(),
    currentUser: null,
  });
});

jest.mock("instabug-reactnative", () => ({
  init: jest.fn(),
  setPrimaryColor: jest.fn(),
  InvocationEvent: {
    shake: "shake",
    screenshot: "screenshot",
    floatingButton: "floatingButton",
  },
}));


describe("RootLayout", () => {
  it("renders the AuthProvider and Stack navigator correctly", async () => {
    await waitFor(() => {
      const { toJSON } = render(<RootLayout />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  it("wraps the application with AuthProvider", async () => {
    await waitFor(() => {
      const { UNSAFE_getByType } = render(<RootLayout />);
      expect(UNSAFE_getByType(AuthProvider)).toBeTruthy();
    });
  });

  it("renders the Stack navigator with headerHidden option", async () => {
    await waitFor(() => {
      render(<RootLayout />);
      expect(Stack).toHaveBeenCalledWith(
        { screenOptions: { headerShown: false } },
        {}
      );
    });
  });
});
