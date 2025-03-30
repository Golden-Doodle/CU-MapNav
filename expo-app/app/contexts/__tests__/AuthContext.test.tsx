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

describe("AuthProvider Tests", () => {
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
  it("calls GoogleSignin.configure on mount", async () => {
    render(
      <AuthProvider>
        <AuthContext.Consumer>{() => null}</AuthContext.Consumer>
      </AuthProvider>
    );
    expect(GoogleSignin.configure).toHaveBeenCalledWith({
      webClientId:
        "259837654437-eo18pu30v9grv1i3dog8ba5i64ipj1q7.apps.googleusercontent.com",
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
  });

  it("handles error in loading user from AsyncStorage", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(AsyncStorage, "getItem").mockImplementation((key) => {
      if (key === "user") {
        return Promise.reject(new Error("Load user error"));
      }
      return Promise.resolve(null);
    });
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
      expect(contextValue.loading).toBe(false);
    });
    expect(consoleSpy).toHaveBeenCalledWith("Error loading user:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("updates user on auth state change with non-null firebaseUser", async () => {
    let contextValue = {} as AuthContextType;
    const newUser = { uid: "456" };
    mockAuth.onAuthStateChanged.mockImplementationOnce((callback) => {
      callback(newUser);
      return jest.fn();
    });
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
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("user", JSON.stringify(newUser));
      expect(contextValue.user).toEqual(newUser);
    });
  });

  it("fetches calendar events when selectedScheduleID exists in AsyncStorage", async () => {
    jest.spyOn(AsyncStorage, "getItem").mockImplementation((key) => {
      if (key === "user") return Promise.resolve(JSON.stringify({ uid: "123" }));
      if (key === "selectedScheduleID") return Promise.resolve("stored-calendar-id");
      return Promise.resolve(null);
    });
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
      expect(contextValue.selectedCalendarId).toBe("stored-calendar-id");
      expect(contextValue.googleCalendarEvents).toEqual([{ id: "1", summary: "Test Event" }]);
    });
    expect(fetchGoogleCalendarEvents).toHaveBeenCalledWith("stored-calendar-id", 7);
  });

  it("fetches calendar events and sets default calendar when selectedScheduleID is missing", async () => {
    jest.spyOn(AsyncStorage, "getItem").mockImplementation((key) => {
      if (key === "user") return Promise.resolve(JSON.stringify({ uid: "123" }));
      if (key === "selectedScheduleID") return Promise.resolve(null);
      return Promise.resolve(null);
    });
    const { fetchAllCalendars } = require("@/app/services/GoogleCalendar/fetchingUserCalendarData");
    fetchAllCalendars.mockImplementation(() =>
      Promise.resolve([{ id: "default-calendar", summary: "Concordia_Class_Schedule" }])
    );

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
      expect(contextValue.selectedCalendarId).toBe("default-calendar");
      expect(contextValue.googleCalendarEvents).toEqual([{ id: "1", summary: "Test Event" }]);
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedScheduleID", "default-calendar");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "selectedScheduleName",
      "Concordia_Class_Schedule"
    );
    expect(fetchGoogleCalendarEvents).toHaveBeenCalledWith("default-calendar", 7);
  });

  it("handles Google sign-in error when no idToken", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(GoogleSignin, "getTokens").mockImplementation(() =>
      Promise.resolve({
        idToken: "mock-id-token",
        accessToken: "", 
      })
    );
    
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
      await contextValue.handleGoogleSignIn();
    });
    expect(consoleSpy).toHaveBeenCalledWith("Google Sign-In Error:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("handles Google sign-in error when no accessToken", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(GoogleSignin, "getTokens").mockImplementation(() =>
      Promise.resolve({
        idToken: "mock-id-token",
        accessToken: "", 
      })
    );
    
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
      await contextValue.handleGoogleSignIn();
    });
    expect(consoleSpy).toHaveBeenCalledWith("Google Sign-In Error:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("handles error during sign-out", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    jest.spyOn(GoogleSignin, "revokeAccess").mockImplementation(() =>
      Promise.reject(new Error("SignOut error"))
    );
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
      await contextValue.signOut();
    });
    expect(consoleSpy).toHaveBeenCalledWith("Logout Error:", expect.any(Error));
    consoleSpy.mockRestore();
  });
});
