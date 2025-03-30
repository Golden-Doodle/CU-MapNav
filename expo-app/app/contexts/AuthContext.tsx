// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import { Alert } from "react-native"; // <-- Import Alert
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { GoogleCalendarEvent } from "../utils/types";

export interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  setUser: React.Dispatch<React.SetStateAction<FirebaseAuthTypes.User | null>>;
  loading: boolean;
  handleGoogleSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  handleSignInAsGuest: () => Promise<void>;
  googleCalendarEvents: GoogleCalendarEvent[];
  selectedCalendarId: string | null;
  setSelectedCalendarId: (id: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "259837654437-eo18pu30v9grv1i3dog8ba5i64ipj1q7.apps.googleusercontent.com",
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (error) {
        console.error("Error loading user:", error);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
      } else {
        await AsyncStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResponse = await GoogleSignin.signIn();
      const { idToken, accessToken } = await GoogleSignin.getTokens();

      if (!idToken) throw new Error("Google Sign-In failed: No ID Token received.");
      if (!accessToken) throw new Error("Google Sign-In failed: No Access Token received.");

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      await AsyncStorage.setItem("user", JSON.stringify(userCredential.user));

      router.replace("/screens/Home/HomePageScreen");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleSignInAsGuest = async () => {
    router.replace("/screens/Home/HomePageScreen");
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await auth().signOut();
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("selectedScheduleID");
      await AsyncStorage.removeItem("selectedScheduleName");
      await AsyncStorage.removeItem("googleAccessToken");
      setUser(null);
      setSelectedCalendarId(null);
      setGoogleCalendarEvents([]);
      router.replace("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        handleGoogleSignIn,
        signOut,
        handleSignInAsGuest,
        googleCalendarEvents,
        selectedCalendarId,
        setSelectedCalendarId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
