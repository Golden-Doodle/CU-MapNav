import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import IndoorMap from '../../components/IndoorNavigation/IndoorMap';
import IndoorNavigationHeader from '../../components/IndoorNavigation/IndoorNavigationHeader';
import BottomNavigation from '../../components/BottomNavigation/BottomNavigation';

const IndoorMapScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header at the top */}
      <IndoorNavigationHeader testID="indoor-navigation-header" />

      {/* Main content area for the indoor map */}
      <View style={styles.content}>
        <IndoorMap />
      </View>

      {/* Bottom navigation */}
      <BottomNavigation testID="bottom-navigation" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default IndoorMapScreen;
