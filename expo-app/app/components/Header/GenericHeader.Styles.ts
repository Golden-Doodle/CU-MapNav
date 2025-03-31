import { StyleSheet } from "react-native";

export const headerStyles = StyleSheet.create({
  background: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    alignItems: "center",
  },
  reportTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  noticeText: {
    fontSize: 15,
    color: "#912338",
    marginLeft: 8,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    padding: 10,
    zIndex: 10,
  },
});