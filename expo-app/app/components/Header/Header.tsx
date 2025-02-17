import React from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import styles from "./Header.styles";
import { AuthContext } from "@/app/contexts/AuthContext";
import NextClassComponent from "./NextClassComponent";


export default function Header(): JSX.Element {
  const router = useRouter();
  const auth = React.useContext(AuthContext);

  const user = auth?.user || null;
  const signOut = auth?.signOut;
 

  return (
    <ImageBackground
      source={require("../../../assets/images/header-background.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay} />

      {/* Header Row for Icons */}
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={!user ? () => router.push("/") : signOut}
        >
          {!user ? (
            <Feather name="log-in" size={22} color="white" />
          ) : (
            <Feather name="log-out" size={22} color="white" />
          )}
        </TouchableOpacity>

        {/* Hamburger Menu */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push("/screens/Home/HomeMenuScreen")}
        >
          <Feather name="menu" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* Text & Buttons */}
      <View style={styles.headerContent}>
        <Text style={styles.welcomeText}>
          {user?.displayName ? `Welcome Back, ${user.displayName}` : "Welcome!"}
        </Text>
        <NextClassComponent style={styles.timerText}/>

        {/* Optimize Route Button */}
        <TouchableOpacity style={styles.routeButton}>
          <Text style={styles.routeButtonText}>Optimize Route</Text>
        </TouchableOpacity>

        <Text style={styles.studySpotText}>
          Find your next study spot or coffee stop.
        </Text>
      </View>
    </ImageBackground>
  );
}
