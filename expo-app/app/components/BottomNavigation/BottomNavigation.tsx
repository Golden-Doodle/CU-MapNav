import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface BottomNavigationProps {
    testID: string; 
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ testID }) => {
  
  const { t } = useTranslation("HomePageScreen");
  const router = useRouter();

  const TABS = [
    {
      label: t("Home"),
      icon: "home",
      path: "/screens/Home/HomePageScreen",
    },
    { 
      label: t("Services"), 
      icon: "concierge-bell",
      path: "/screens/Services/ServicesScreen",
    },
    {
      label: t("Report"),
      icon: "exclamation-circle",
      path: "/screens/Report/ReportScreen",
    },
    {
      label: t("Settings"),
      icon: "cog",
      path: "/screens/Settings/SettingsScreen",
    },
  ];

  return (
    <View style={styles.container} testID={testID}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.label}
          style={styles.tab}
          onPress={() => router.push(tab.path as any)} 
          testID={`${testID}-${tab.label.toLowerCase()}-tab`} 
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

export default BottomNavigation;