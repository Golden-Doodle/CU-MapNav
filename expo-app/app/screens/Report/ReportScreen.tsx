import { View, StyleSheet, ScrollView } from "react-native";
import ReportHeader from "../../components/Report/ReportHeader"; 
import ReportForm from "../../components/Report/ReportForm";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

export default function ReprotScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <ReportHeader />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ReportForm />
      </ScrollView>
      
      <View style={styles.navContainer}>
        <BottomNavigation testID="bottom-navigation"/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  navContainer: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
});
