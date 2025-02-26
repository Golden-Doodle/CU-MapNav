import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function BottomNavigation() {
  const { t } = useTranslation("HomePageScreen");
  const router = useRouter();

  const TABS = [
    {
      label: t("home_tab"),
      icon: "home",
      path: "/screens/Home/HomePageScreen",
    },
    { label: t("services_tab"), icon: "concierge-bell" },
    {
      label: t("report_tab"),
      icon: "exclamation-circle",
      path: "/screens/Report/ReportScreen",
    },
    {
      label: t("settings_tab"),
      icon: "cog",
      path: "/screens/Settings/SettingsScreen",
    },
  ];

  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.label}
          style={styles.tab}
          onPress={() => router.push(tab.path as any)}
        >
          <FontAwesome5 name={tab.icon} size={22} color="#999" />
          <Text style={styles.label}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 25,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  tab: {
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    color: "#999",
    marginTop: 3,
  },
});
