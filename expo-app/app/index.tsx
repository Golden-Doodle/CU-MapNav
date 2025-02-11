import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function LoginScreen() {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  });

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  const handleGuestAccess = () => {
    router.push("/screens/Home/HomePageScreen");
  };

  const animatedX1 = useRef(new Animated.Value(0)).current;
  const animatedY1 = useRef(new Animated.Value(0)).current;

  const animatedX2 = useRef(new Animated.Value(0)).current;
  const animatedY2 = useRef(new Animated.Value(0)).current;

  const animatedX3 = useRef(new Animated.Value(0)).current;
  const animatedY3 = useRef(new Animated.Value(0)).current;

  const animatedX4 = useRef(new Animated.Value(0)).current;
  const animatedY4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createSmoothAnimation = (animatedX: Animated.Value, animatedY: Animated.Value, xRange: number, yRange: number, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(animatedX, {
              toValue: xRange,
              duration: duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(animatedY, {
              toValue: yRange,
              duration: duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ]),
          Animated.parallel([
            Animated.timing(animatedX, {
              toValue: 0, 
              duration: duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(animatedY, {
              toValue: 0,
              duration: duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ]),
        ])
      ).start();
    };

    createSmoothAnimation(animatedX1, animatedY1, 40, 30, 5000);
    createSmoothAnimation(animatedX2, animatedY2, 50, 20, 4500);
    createSmoothAnimation(animatedX3, animatedY3, 35, 40, 6000);
    createSmoothAnimation(animatedX4, animatedY4, 45, 25, 5500);
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated SVG Background */}
      <Svg style={StyleSheet.absoluteFillObject}>
        <AnimatedCircle
          cx={animatedX1.interpolate({ inputRange: [-40, 40], outputRange: [0, 40] })}
          cy={animatedY1.interpolate({ inputRange: [-30, 30], outputRange: [30, 60] })}
          r="100"
          fill="#731b2b"
          opacity="0.6"
        />
        <AnimatedCircle
          cx={animatedX2.interpolate({ inputRange: [-50, 50], outputRange: [400, 450] })}
          cy={animatedY2.interpolate({ inputRange: [-20, 20], outputRange: [275, 295] })}
          r="100"
          fill="#731b2b"
          opacity="0.5"
        />
        <AnimatedCircle
          cx={animatedX3.interpolate({ inputRange: [-35, 35], outputRange: [80, 115] })}
          cy={animatedY3.interpolate({ inputRange: [-40, 40], outputRange: [500, 540] })}
          r="100"
          fill="#731b2b"
          opacity="0.4"
        />
        <AnimatedCircle
          cx={animatedX4.interpolate({ inputRange: [-45, 45], outputRange: [330, 375] })}
          cy={animatedY4.interpolate({ inputRange: [-25, 25], outputRange: [700, 725] })}
          r="100"
          fill="#731b2b"
          opacity="0.6"
        />
      </Svg>

      {/* App Logo */}
      <Image source={require("../../expo-app/assets/images/concordia-logo.png")} style={styles.logo} />

      {/* Welcome Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome to Concordia Navigator</Text>
        <Text style={styles.subtitle}>Sign in or continue as a guest</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} activeOpacity={0.8}>
          <Image source={require("../../expo-app/assets/images/google-logo.png")} style={styles.googleImage} />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestButton} onPress={handleGuestAccess} activeOpacity={0.8}>
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
    alignItems: "center"
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
    marginBottom: 20
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});