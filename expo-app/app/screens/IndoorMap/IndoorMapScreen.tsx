import React from "react";
import { SafeAreaView, Text } from "react-native";
import { MiMapView } from "@mappedin/react-native-sdk";

// See Trial API key Terms and Conditions
// https://developer.mappedin.com/docs/demo-keys-and-maps

const options = {
  mapId: "67c87db88e15de000bed1abb", // 1515 Rue SainteCatherine Ouest Montral QC H3G 2W1 -- hall building
  key: "mik_yV3rqh17CVlYoJ7VK545d0745", // gabTest - Key
  secret: "mis_Iffk0rbiyPNlshIquwpG88PemTgPB4PMGOdWB0lVom8a001109a", // gabTest - Secret
};

const IndoorMapScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MiMapView style={{ flex: 1 }} key="mappedin" options={options} />
    </SafeAreaView>
  );
};

export default IndoorMapScreen;
