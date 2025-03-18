import React from "react";
import { SafeAreaView, Text } from "react-native";
import { MiMapView, TGetVenueOptions } from "@mappedin/react-native-sdk";

// See Trial API key Terms and Conditions
// https://developer.mappedin.com/docs/demo-keys-and-maps

const options: TGetVenueOptions = {
  //Details for demo map (just for testing)
  clientId: "5eab30aa91b055001a68e996",
  clientSecret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
  venue: "mappedin-demo-mall",
  perspective: "Website",

  //Details for GoldenDoodle map
  //mapId: '67c87db88e15de000bed1abb',
  //key: 'mik_LUeYSdqlvDJYpSHXT56b207a8',
  //secret: 'mis_toNhLLj9mmlK5rJzJHebi3km4rjI9V3x3VUzgpPCYbq9a2410c7',
};

const IndoorMapScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>Test</Text>
      <MiMapView style={{ flex: 1 }} key="mappedin" options={options} />
    </SafeAreaView>
  );
};

export default IndoorMapScreen;
