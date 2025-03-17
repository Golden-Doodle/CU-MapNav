// Header.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { styles } from "./Header.styles";
import { AuthContext } from "@/app/contexts/AuthContext";
import NextClassComponent from "./NextClassComponent";
import { GoogleCalendarEvent } from "@/app/utils/types";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  refreshCalendarEvents: () => void;
  isLoading: boolean;
  calendarEvents: GoogleCalendarEvent[];
}

export default function Header({
  refreshCalendarEvents,
  isLoading,
  calendarEvents,
}: HeaderProps) {

  const { t } = useTranslation("HomePageScreen"); // Used for tranlation

  const router = useRouter();
  const auth = React.useContext(AuthContext);
  const user = auth?.user || null;
  const signOut = auth?.signOut;

  const [nextClass, setNextClass] = useState<GoogleCalendarEvent | null>(null);

  const onOptimizeRoutePress = () => {
    router.push({
      pathname: "/screens/Home/CampusMapScreen",
      params: {
        pressedOptimizeRoute: "true",
      },
    });
  };

  return (
    <ImageBackground
      source={require("@/assets/images/header-background.jpg")}
      style={styles.headerContainer}
      testID="header-background"
    >
      <View style={styles.headerContainer}>
        {/* Overlay */}
        <View style={styles.overlay} testID="overlay" />

        {/* Header Top Row for Icons */}
        <View style={styles.headerTopRow} testID="header-top-row">
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={!user ? () => router.push("/") : signOut}
            testID={!user ? "login-button" : "logout-button"}
          >
            <Feather name={!user ? "log-in" : "log-out"} size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/screens/Home/HomeMenuScreen")}
            testID="menu-button"
          >
            <Feather name="menu" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* Header Content */}
        <View style={styles.headerContent} testID="header-content">
          <Text style={styles.welcomeText} testID="welcome-text">
            {user?.displayName ? `${t("Welcome Back")}, ${user.displayName}` : `${t("Welcome")}!`}
          </Text>
          <NextClassComponent
            calendarEvents={calendarEvents}
            style={styles.timerText}
            nextClass={nextClass}
            setNextClass={setNextClass}
            testID="next-class-component"
          />

          {/* Optimize Routes Button - Disabled if no classes */}
          {user && (
            <TouchableOpacity
              style={[styles.routeButton, !nextClass && styles.disabledRouteButton]}
              onPress={onOptimizeRoutePress}
              disabled={!nextClass}
              testID="optimize-route-button"
            >
              <Text style={styles.routeButtonText}>{t("Optimize Route")}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.studySpotText} testID="study-spot-text">
            {t("Find your next study spot or coffee stop.")}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
