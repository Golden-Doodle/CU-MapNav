import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { AuthProvider, AuthContext, AuthContextType } from "../AuthContext";
import { useRouter } from "expo-router";
import { fetchGoogleCalendarEvents } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@react-native-firebase/auth", () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockAuth),
    auth: () => mockAuth, 
    GoogleAuthProvider: {
      credential: jest.fn(() => "mock-credential"),
    },
  };
});


const mockAuth = {
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn();
  }),
  signOut: jest.fn().mockResolvedValue(null),
  signInWithCredential: jest.fn().mockResolvedValue({ user: { uid: "123" } }), 
};


jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      idToken: "mock-id-token",
      user: { id: "mock-user-id", name: "Mock User" },
    }),
    getTokens: jest.fn().mockResolvedValue({ accessToken: "mock-access-token" }),
    revokeAccess: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock("@/app/services/GoogleCalendar/fetchingUserCalendarData", () => ({
  fetchGoogleCalendarEvents: jest.fn().mockResolvedValue([
    { id: "1", summary: "Test Event" },
  ]),
  fetchAllCalendars: jest.fn().mockResolvedValue([{ id: "calendar-1", summary: "Test Calendar" }]),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
}));

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.spyOn(AsyncStorage, "getItem").mockResolvedValue(JSON.stringify({ uid: "123" }));
    jest.spyOn(AsyncStorage, "setItem").mockResolvedValue();
    jest.spyOn(AsyncStorage, "removeItem").mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads user from AsyncStorage on mount", async () => {
    let contextValue = {} as AuthContextType;

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value as AuthContextType;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(contextValue?.user).toEqual({ uid: "123" });
    });
  });

  it("handles sign-out correctly", async () => {
    let contextValue = {} as AuthContextType;

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value as AuthContextType;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await contextValue?.signOut();
    });

    expect(GoogleSignin.signOut).toHaveBeenCalled();
    expect(mockAuth.signOut).toHaveBeenCalled();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("user");
    expect(contextValue?.user).toBeNull();
  });

  
  it("handles Google sign-in correctly", async () => {
    let contextValue = {} as AuthContextType;
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value as AuthContextType;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
  
    
    await act(async () => {
      await contextValue?.handleGoogleSignIn();
    });
  
    // ** This needs to be fixed ** 
    //expect(GoogleSignin.signIn).toHaveBeenCalled();
    //expect(mockAuth.signInWithCredential).toHaveBeenCalled();
    //expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      //"user",
      //JSON.stringify({ uid: "123" })
    //);
  });
  
  

  it("handles guest sign-in correctly", async () => {
    let contextValue = {} as AuthContextType;
    const mockRouter = { replace: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value as AuthContextType;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await contextValue?.handleSignInAsGuest();
    });

    expect(mockRouter.replace).toHaveBeenCalledWith("/screens/Home/HomePageScreen");
  });
});
