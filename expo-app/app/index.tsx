import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { AuthContext } from "./contexts/AuthContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SignInScreen() {
  const router = useRouter();

  const authContext = React.useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user } = authContext;

  useEffect(() => {
    if (user) {
      router.push("/screens/Home/HomePageScreen");
    }
  }, [user]);

  const { handleGoogleSignIn, handleSignInAsGuest, loading } = authContext;

  const animation1 = useRef(new Animated.Value(0)).current;
  const animation2 = useRef(new Animated.Value(0)).current;
  const animation3 = useRef(new Animated.Value(0)).current;
  const animation4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateCircle = (animation: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 20,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateCircle(animation1, 3000);
    animateCircle(animation2, 4000);
    animateCircle(animation3, 5000);
    animateCircle(animation4, 6000);
  }, []);

  if (loading) return <View style={{ flex: 1, backgroundColor: "#FFF" }} />;

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFillObject}>
        <AnimatedCircle
          cx={150}
          cy={150}
          r="130"
          fill="#731b2b"
          opacity="0.6"
          transform={[{ translateY: animation1 }]}
        />
        <AnimatedCircle
          cx={320}
          cy={375}
          r="100"
          fill="#912338"
          opacity="0.5"
          transform={[{ translateY: animation2 }]}
        />
        <AnimatedCircle
          cx={120}
          cy={550}
          r="110"
          fill="#b52e45"
          opacity="0.4"
          transform={[{ translateY: animation3 }]}
        />
        <AnimatedCircle
          cx={320}
          cy={750}
          r="130"
          fill="#d0465b"
          opacity="0.3"
          transform={[{ translateY: animation4 }]}
        />
      </Svg>

      <Image
        source={require("../../expo-app/assets/images/concordia-logo.png")}
        style={styles.logo}
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome to Concordia Navigator</Text>
        <Text style={styles.subtitle}>Sign in or continue as a guest</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <Image
            source={require("../../expo-app/assets/images/google-logo.png")}
            style={styles.googleImage}
          />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleSignInAsGuest}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 400,
    height: 120,
    marginTop: 100,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#731b2b",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 15,
    width: "85%",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  googleImage: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  guestButton: {
    backgroundColor: "#912338",
    paddingVertical: 16,
    borderRadius: 15,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
