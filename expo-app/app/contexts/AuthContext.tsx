import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { fetchCalendarEvents } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";
import { GoogleCalendarEvent } from "../utils/types";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  setUser: React.Dispatch<React.SetStateAction<FirebaseAuthTypes.User | null>>;
  loading: boolean;
  handleGoogleSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  handleSignInAsGuest: () => Promise<void>;
  googleCalendarEvents: GoogleCalendarEvent[];
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<
    GoogleCalendarEvent[]
  >([]); // 👈 Add state for Google Calendar events -- will add type safety

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "259837654437-eo18pu30v9grv1i3dog8ba5i64ipj1q7.apps.googleusercontent.com",
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"], // 👈 Request Google Calendar permission
    });
  }, []);

  useEffect(() => {
    // Load user data from AsyncStorage on app start
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  useEffect(() => {
    // Listen for Firebase authentication state changes
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
      } else {
        await AsyncStorage.removeItem("user");
      }
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    async function fetchGCData() {
      const events = await fetchCalendarEvents();
      setGoogleCalendarEvents(events);
    }
    fetchGCData();
  }, [user]);

  // Google Sign-In function
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResponse = await GoogleSignin.signIn();
      const { idToken, accessToken } = await GoogleSignin.getTokens();
      // console.log("accessToken", accessToken);

      if (!idToken) {
        throw new Error("Google Sign-In failed: No ID Token received.");
      }

      if (!accessToken) {
        throw new Error("Google Sign-In failed: No Access Token received.");
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential
      );

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(userCredential.user) || ""
      );

      await AsyncStorage.setItem("googleAccessToken", accessToken);

      router.replace("/screens/Home/HomePageScreen");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleSignInAsGuest = async () => {
    router.replace("/screens/Home/HomePageScreen");
  };

  // Sign out function
  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await auth().signOut();
      await AsyncStorage.removeItem("user");
      setUser(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
