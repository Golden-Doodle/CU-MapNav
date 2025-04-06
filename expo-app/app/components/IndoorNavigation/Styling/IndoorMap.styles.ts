import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  contentContainer: { flex: 1 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    zIndex: 20,
  },
  accessibilityButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    padding: 8,
    zIndex: 20,
  },
  directionsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 8,
    zIndex: 20,
  },
  directionsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 15,
  },
  directionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 10,
    width: 280,
    maxHeight: 300,
    elevation: 3,
  },
  directionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  directionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  directionsList: { marginVertical: 5 },
  instruction: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
  directionsButtonColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
  },
  iconButton: { padding: 5 },
  button: {
    backgroundColor: '#912338',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  cancelButton: { backgroundColor: '#FF3B30' },
  showButton: { backgroundColor: '#912338' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default styles;