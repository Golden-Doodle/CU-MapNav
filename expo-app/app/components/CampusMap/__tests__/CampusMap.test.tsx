jest.setTimeout(10000);
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { fetchNearbyRestaurants } from "@/app/services/GoogleMap/googlePlacesService";

jest.mock("../HamburgerWidget", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <>
      <TouchableOpacity
        testID="toggle-campus-button-hamburger-button"
        onPress={props.toggleCampus}
      >
        <Text>Hamburger</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="toggle-campus-button-toggle-campus-button"
        onPress={props.toggleCampus}
      >
        <Text>{props.campus === "LOY" ? "View SGW Campus" : "View Loyola Campus"}</Text>
      </TouchableOpacity>
    </>
  );
});

jest.mock(
  "@/app/components/IndoorNavigation/IndoorMap",
  () => {
    const React = require("react");
    return function MockIndoorMap(props: any) {
      return <React.Fragment />;
    };
  }
);

jest.mock("expo-location", () => ({
  Accuracy: { High: 3 },
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 45.5017, longitude: -73.5673 },
  }),
  watchPositionAsync: jest.fn().mockImplementation((options, callback) => {
    callback({ coords: { latitude: 45.5017, longitude: -73.5673 } });
    return { remove: jest.fn() };
  }),
}));

jest.mock("@/app/services/GoogleMap/googlePlacesService", () => ({
  fetchNearbyRestaurants: jest.fn().mockResolvedValue([
    {
      place_id: "1",
      name: "Restaurant 1",
      geometry: { location: { lat: 45.5017, lng: -73.5673 } },
      vicinity: "Near campus",
      rating: 4.5,
    },
  ]),
}));

jest.mock("@/app/utils/directions", () => ({
  getDirections: jest.fn().mockResolvedValue([{ latitude: 45.5017, longitude: -73.5673 }]),
}));

jest.mock("@/app/utils/MapUtils", () => ({
  calculateDistance: jest.fn(() => 50),
  isPointInPolygon: jest.fn(() => true),
}));

jest.mock("@/app/utils/helperFunctions", () => ({
  getFillColorWithOpacity: jest.fn(() => "rgba(0,0,0,0.5)"),
}));

jest.mock("../modals/SearchModal", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: any) =>
    props.visible ? (
      <View testID="search-modal">
        <TouchableOpacity
          testID="search-modal-get-directions-button"
          onPress={props.onGetDirections}
        >
          <Text>Get Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="search-modal-close-icon" onPress={props.onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    ) : null;
});

jest.mock("../CampusMapNavTab", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <View testID="nav-tab">
      <TouchableOpacity testID="nav-tab-nav-item-Search" onPress={props.onSearchPress}>
        <Text>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-tab-nav-item-Directions" onPress={props.onDirectionsPress}>
        <Text>Directions</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-tab-nav-item-Eat" onPress={props.onEatPress}>
        <Text>Eat</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-tab-nav-item-Class" onPress={props.onNextClassPress}>
        <Text>Class</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-tab-nav-item-Back" onPress={props.onBackPress}>
        <Text>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-tab-nav-item-MoreOptions" onPress={props.onMoreOptionsPress}>
        <Text>More Options</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="nav-tab-nav-item-Info" onPress={props.onInfoPress}>
        <Text>Info</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock("../modals/BuildingInfoModal", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: any) => {
    if (!props.visible) return null;
    return (
      <View testID="building-info-modal-content">
        <TouchableOpacity
          testID="building-info-modal-close-button"
          onPress={props.onClose}
        >
          <Text>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="building-info-modal-use-as-origin-button"
          onPress={props.onUseAsOrigin}
        >
          <Text>Use As Origin</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock("../modals/TransitModal", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: any) => {
    if (!props.visible) return null;
    return (
      <View testID="transit-modal-modal">
        <TouchableOpacity
          testID="transit-modal-close-button"
          onPress={props.onClose}
        >
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock("../modals/NextClassModal", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: any) => {
    if (!props.visible) return null;
    return (
      <View testID="next-class-modal-overlay">
        <TouchableOpacity
          testID="next-class-modal-close-button"
          onPress={props.onClose}
        >
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock("../data/buildingData", () => ({
  SGWBuildings: [
    {
      id: "FB",
      name: "Test Building FB",
      description: "Test description",
      coordinates: [{ latitude: 45.5017, longitude: -73.5673 }],
      strokeColor: "blue",
      fillColor: "rgba(0, 0, 255, 0.5)",
      campus: "SGW",
      photoUrl: "",
      rating: 4.0,
    },
  ],
  LoyolaBuildings: [],
}));

jest.mock("../data/customMarkerData", () => ({
  initialRegion: {
    SGW: { latitude: 45.5017, longitude: -73.5673, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    LOY: { latitude: 45.5017, longitude: -73.5673, latitudeDelta: 0.005, longitudeDelta: 0.005 },
  },
  SGWMarkers: [],
  LoyolaMarkers: [],
}));

jest.mock("../CustomMarker", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity testID={props.testID} onPress={props.onPress}>
      <Text>{props.title}</Text>
    </TouchableOpacity>
  );
});

import CampusMap from "../CampusMap";

// Helper to render CampusMap with default props
const renderCampusMap = () => render(<CampusMap pressedOptimizeRoute={false} />);

describe("CampusMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the map", () => {
    const { getByTestId } = renderCampusMap();
    expect(getByTestId("campus-map")).toBeTruthy();
  });

  it("should toggle between SGW and Loyola campuses when button pressed", async () => {
    const { getByTestId, getByText } = renderCampusMap();
    const hamburgerButton = getByTestId("toggle-campus-button-hamburger-button");
    act(() => {
      fireEvent.press(hamburgerButton);
    });
    const toggleButton = getByTestId("toggle-campus-button-toggle-campus-button");
    await waitFor(() => expect(getByText("View SGW Campus")).toBeTruthy());
    act(() => {
      fireEvent.press(toggleButton);
    });
    await waitFor(() => expect(getByText("View Loyola Campus")).toBeTruthy());
    act(() => {
      fireEvent.press(toggleButton);
    });
    await waitFor(() => expect(getByText("View SGW Campus")).toBeTruthy());
  });

  it("should display a destination marker when a location is long-pressed on the map", async () => {
    const { getByTestId } = renderCampusMap();
    const map = getByTestId("campus-map");
    act(() => {
      fireEvent(map, "onLongPress", {
        nativeEvent: { coordinate: { latitude: 45.5017, longitude: -73.5673 } },
      });
    });
    await waitFor(() => expect(getByTestId("destination-marker-marker")).toBeTruthy());
  });

  it("should display building markers on the map and open modal when clicked", async () => {
    const { getByTestId, queryByTestId } = renderCampusMap();
    const buildingMarker = getByTestId("building-marker-FB-marker");
    expect(buildingMarker).toBeTruthy();
    act(() => {
      fireEvent.press(buildingMarker);
    });
    await waitFor(() => expect(getByTestId("building-info-modal-content")).toBeTruthy());
    act(() => {
      fireEvent.press(getByTestId("building-info-modal-close-button"));
    });
    await waitFor(() =>
      expect(queryByTestId("building-info-modal-content")).toBeNull()
    );
  });

  it("should open and close the TransitModal when the directions button is pressed", async () => {
    const { getByTestId, queryByTestId } = renderCampusMap();
    const map = getByTestId("campus-map");
    act(() => {
      fireEvent(map, "onLongPress", {
        nativeEvent: { coordinate: { latitude: 45.5017, longitude: -73.5673 } },
      });
    });
    await waitFor(() => expect(getByTestId("destination-marker-marker")).toBeTruthy());
    const directionsButton = getByTestId("nav-tab-nav-item-Directions");
    act(() => {
      fireEvent.press(directionsButton);
    });
    await waitFor(() => expect(getByTestId("transit-modal-modal")).toBeTruthy());
    act(() => {
      fireEvent.press(getByTestId("transit-modal-close-button"));
    });
    await waitFor(() =>
      expect(queryByTestId("transit-modal-modal")).toBeNull()
    );
  });

  it("should open and close the NextClassModal when the next class button is pressed", async () => {
    const { getByTestId, queryByTestId } = renderCampusMap();
    const nextClassButton = getByTestId("nav-tab-nav-item-Class");
    act(() => {
      fireEvent.press(nextClassButton);
    });
    await waitFor(() =>
      expect(getByTestId("next-class-modal-overlay")).toBeTruthy()
    );
    act(() => {
      fireEvent.press(getByTestId("next-class-modal-close-button"));
    });
    await waitFor(() =>
      expect(queryByTestId("next-class-modal-overlay")).toBeNull()
    );
  });

  it("should reset destination when back button is pressed in NavTab", async () => {
    const { getByTestId, queryByTestId } = renderCampusMap();
    act(() => {
      fireEvent(getByTestId("campus-map"), "onLongPress", {
        nativeEvent: { coordinate: { latitude: 45.5017, longitude: -73.5673 } },
      });
    });
    await waitFor(() =>
      expect(getByTestId("destination-marker-marker")).toBeTruthy()
    );
    act(() => {
      fireEvent.press(getByTestId("nav-tab-nav-item-Back"));
    });
    await waitFor(() =>
      expect(queryByTestId("destination-marker-marker")).toBeNull()
    );
  });

  it("should open and close the Search Modal when the search button is pressed", async () => {
    const { getByTestId, queryByTestId } = renderCampusMap();
    act(() => {
      fireEvent.press(getByTestId("nav-tab-nav-item-Search"));
    });
    await waitFor(() => expect(getByTestId("search-modal")).toBeTruthy());
    act(() => {
      fireEvent.press(getByTestId("search-modal-close-icon"));
    });
    await waitFor(() =>
      expect(queryByTestId("search-modal")).toBeNull()
    );
  });

  it("swaps origin and destination when handleOnUseAsOrigin is called", async () => {
    const { getByTestId, queryByTestId } = renderCampusMap();
    act(() => {
      fireEvent.press(getByTestId("building-marker-FB-marker"));
    });
    await waitFor(() =>
      expect(queryByTestId("building-info-modal-use-as-origin-button")).toBeTruthy()
    );
    act(() => {
      fireEvent.press(getByTestId("building-info-modal-use-as-origin-button"));
    });
    await waitFor(() =>
      expect(queryByTestId("building-info-modal-use-as-origin-button")).toBeNull()
    );
  });

  it("should alert when location permission is not granted", async () => {
    const { requestForegroundPermissionsAsync } = require("expo-location");
    requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: "denied" });
    const alertSpy = jest.spyOn(Alert, "alert");
    renderCampusMap();
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(expect.any(String), expect.any(String))
    );
  });

  it("should alert when fetching route with missing destination", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = renderCampusMap();
    act(() => {
      fireEvent.press(getByTestId("nav-tab-nav-item-Search"));
    });
    await waitFor(() =>
      expect(getByTestId("search-modal")).toBeTruthy()
    );
    act(() => {
      fireEvent.press(getByTestId("search-modal-get-directions-button"));
    });
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("Select a destination point")
    );
  });

  it("should fetch route and render polyline when origin and destination exist", async () => {
    const { getByTestId } = renderCampusMap();
    const map = getByTestId("campus-map");
    act(() => {
      fireEvent(map, "onLongPress", {
        nativeEvent: { coordinate: { latitude: 45.5017, longitude: -73.5673 } },
      });
    });
    await waitFor(() =>
      expect(getByTestId("destination-marker-marker")).toBeTruthy()
    );
    act(() => {
      fireEvent.press(getByTestId("nav-tab-nav-item-Search"));
    });
    await waitFor(() =>
      expect(getByTestId("search-modal")).toBeTruthy()
    );
    act(() => {
      fireEvent.press(getByTestId("search-modal-get-directions-button"));
    });
    await waitFor(() =>
      expect(getByTestId("route-polyline")).toBeTruthy()
    );
  });

  it("should alert when Go Indoor is pressed with no room info", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = renderCampusMap();
    act(() => {
      fireEvent.press(getByTestId("building-marker-FB-marker"));
    });
    await waitFor(() =>
      expect(getByTestId("building-info-modal-content")).toBeTruthy()
    );
    act(() => {
      fireEvent.press(getByTestId("nav-tab-nav-item-Search"));
    });
    await waitFor(() =>
      expect(getByTestId("search-modal")).toBeTruthy()
    );
    act(() => {
      fireEvent.press(getByTestId("search-modal-get-directions-button"));
    });
    await waitFor(() => {
      expect(getByTestId("route-polyline")).toBeTruthy();
      expect(getByTestId("indoor-button")).toBeTruthy();
    });
    act(() => {
      fireEvent.press(getByTestId("indoor-button"));
    });
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "No Room Exists",
        "There is no room number available for this class."
      )
    );
  });

  it("should alert when More Options is pressed in NavTab", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = renderCampusMap();
    act(() => {
      fireEvent.press(getByTestId("nav-tab-nav-item-MoreOptions"));
    });
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("More Options pressed")
    );
  });

  it("should open BuildingInfoModal when Info is pressed in NavTab", async () => {
    const { getByTestId } = renderCampusMap();
    act(() => {
      fireEvent.press(getByTestId("nav-tab-nav-item-Info"));
    });
    await waitFor(() =>
      expect(getByTestId("building-info-modal-content")).toBeTruthy()
    );
  });

  it("should show radius adjuster when eating mode is activated", async () => {
    const { getByTestId, getByText } = renderCampusMap();
    act(() => {
      fireEvent.press(getByTestId("nav-tab-nav-item-Eat"));
    });
    await waitFor(() =>
      expect(getByText("Adjust Search Radius")).toBeTruthy()
    );
    act(() => {
      fireEvent.press(getByText("Adjust Search Radius"));
    });
  });
});