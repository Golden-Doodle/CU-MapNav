import { ExpoConfig, ConfigContext } from "expo/config";
import "dotenv/config";

const base = {
  expo: {
    name: "expo-app",
    slug: "expo-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.goldendoodle.expoapp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      googleServicesFile: "./GoogleService-Info.plist",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.goldendoodle.expoapp",
      googleServicesFile: "./google-services.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "@react-native-google-signin/google-signin",
      [
        "@react-native-firebase/app",
        [
          "expo-build-properties",
          {
            ios: {
              useFrameworks: "static",
            },
          },
        ],
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extras: {},
  },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const newConfig = {
    ...config,
    ...base,
    slug: "expo-app",
    name: "expo-app",
  };
  newConfig.expo.extras = {
    clarityProjectId: process.env.CLARITY_PROJECT_ID,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    mappedInApiKey: process.env.MAPPED_IN_API_KEY,
    mappedInSecret: process.env.MAPPED_IN_SECRET,
    distanceMatrixApiKey: process.env.DISTANCE_MATRIX_API_KEY,
    router: {
      origin: false,
    },
    eas: {
      projectId: "fd5074ae-9387-4f62-9753-f8274ba822e0",
    },
  };
  return newConfig;
};
