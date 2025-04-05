import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons"; // Search icon
import { useTranslation } from "react-i18next"; // Translation
import { useRouter } from "expo-router";

export default function SearchBar() {
  const router = useRouter();
  const { t } = useTranslation("HomePageScreen");

  const [searchText, setSearchText] = useState("");

  return (
    <View style={styles.searchContainer}>
      <Feather name="search" size={20} color="#999" style={styles.icon} />
      <TextInput
        placeholder={t("Search for anything nearby")}
        placeholderTextColor="#999"
        style={styles.searchInput}
        testID="search-input"
        value={searchText} // Controlled input
        onChangeText={setSearchText} // Updates state on change}
        onFocus={() =>
          router.push({
            pathname: "/screens/Home/CampusMapScreen",
            params: {
              pressedSearch: "true",
            },
          })
        } 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 20,
    marginTop: 15,
  },
  icon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});
