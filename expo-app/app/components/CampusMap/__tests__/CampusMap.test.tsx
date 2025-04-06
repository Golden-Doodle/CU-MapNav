jest.setTimeout(10000);
import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  RenderAPI,
} from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@/app/services/GoogleMap/googlePlacesService", () => ({
  fetchNearbyPlaces: jest.fn().mockResolvedValue([
    {
      place_id: "1",
      name: "Restaurant 1",
      geometry: { location: { lat: 45.5017, lng: -73.5673 } },
      vicinity: "Near campus",
      rating: 4.5,
    },
  ]),
}));

jest.mock("../HamburgerWidget", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: { toggleCampus: () => void; campus?: string }) => (
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
        <Text>
          {props.campus === "LOY" ? "View SGW Campus" : "View Loyola Campus"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="toggle-live-shuttle-location"
        onPress={props.toggleCampus}
      >
        <Text>Toggle Live Shuttle Location</Text>
      </TouchableOpacity>
    </>
  );
});

jest.mock("@/app/components/IndoorNavigation/IndoorMap", () => {
  return function MockIndoorMap(props: any) {
    return <></>;
  };
});

jest.mock("expo-location", () => ({
  Accuracy: { High: 3 },
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 45.5017, longitude: -73.5673 },
  }),
  watchPositionAsync: jest.fn().mockImplementation((options, callback) => {
    callback({ coords: { latitude: 45.5017, longitude: -73.5673 } });
    return { remove: jest.fn() };
  }),
}));

jest.mock("@/app/utils/directions", () => ({
  getDirections: jest
    .fn()
    .mockResolvedValue([{ latitude: 45.5017, longitude: -73.5673 }]),
}));

jest.mock("@/app/utils/MapUtils", () => ({
  calculateDistance: jest.fn(() => 50),
  isPointInPolygon: jest.fn(() => true),
}));

jest.mock("@/app/utils/helperFunctions", () => ({
  getFillColorWithOpacity: jest.fn(() => "rgba(0,0,0,0.5)"),
  getCenterCoordinate: jest.fn((coordinates) => coordinates[0]),
}));

jest.mock("../modals/SearchModal", () => {
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: {
    visible: boolean;
    onGetDirections: () => void;
    onClose: () => void;
  }) =>
    props.visible ? (
      <View testID="search-modal">
        <TouchableOpacity
          testID="search-modal-get-directions-button"
          onPress={props.onGetDirections}
        >
          <Text>Get Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="search-modal-close-icon"
          onPress={props.onClose}
        >
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    ) : null;
});

jest.mock("../CampusMapNavTab", () => {
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: {
    onSearchPress: () => void;
    onDirectionsPress: () => void;
    onEatPress: () => void;
    onNextClassPress: () => void;
    onBackPress: () => void;
    onMoreOptionsPress: () => void;
    onInfoPress: () => void;
  }) => (
    <View testID="nav-tab">
      <TouchableOpacity
        testID="nav-tab-nav-item-Search"
        onPress={props.onSearchPress}
      >
        <Text>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="nav-tab-nav-item-Directions"
        onPress={props.onDirectionsPress}
      >
        <Text>Directions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="nav-tab-nav-item-Eat"
        onPress={props.onEatPress}
      >
        <Text>Eat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="nav-tab-nav-item-Class"
        onPress={props.onNextClassPress}
      >
        <Text>Class</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="nav-tab-nav-item-Back"
        onPress={props.onBackPress}
      >
        <Text>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="nav-tab-nav-item-MoreOptions"
        onPress={props.onMoreOptionsPress}
      >
        <Text>More Options</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="nav-tab-nav-item-Info"
        onPress={props.onInfoPress}
      >
        <Text>Info</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock("../modals/BuildingInfoModal", () => {
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: {
    visible: boolean;
    onClose: () => void;
    onUseAsOrigin: () => void;
  }) => {
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
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: { visible: boolean; onClose: () => void }) => {
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
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: { visible: boolean; onClose: () => void }) => {
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
    SGW: {
      latitude: 45.5017,
      longitude: -73.5673,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    },
    LOY: {
      latitude: 45.5017,
      longitude: -73.5673,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    },
  },
  SGWMarkers: [],
  LoyolaMarkers: [],
}));

jest.mock("../CustomMarker", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: { testID: string; onPress: () => void; title: string }) => (
    <TouchableOpacity testID={props.testID} onPress={props.onPress}>
      <Text>{props.title}</Text>
    </TouchableOpacity>
  );
});

jest.mock("@/app/services/ConcordiaShuttle/ConcordiaApiShuttle", () => ({
  fetchBusCoordinates: jest
    .fn()
    .mockResolvedValue([
      { coordinates: { latitude: 45.5017, longitude: -73.5673 } },
      { coordinates: { latitude: 45.502, longitude: -73.568 } },
    ]),
}));

import CampusMap from "../CampusMap";

// ---------------------
// Helper: Render & Actions
// ---------------------
const renderCampusMap = () =>
  render(<CampusMap pressedOptimizeRoute={false} />);

const simulateLongPressOnMap = (
  getByTestId: RenderAPI["getByTestId"],
  coordinate: { latitude: number; longitude: number } = {
    latitude: 45.5017,
    longitude: -73.5673,
  }
): void => {
  const map = getByTestId("campus-map");
  fireEvent(map, "onLongPress", { nativeEvent: { coordinate } });
};

const openCloseModal = async (
  renderAPI: RenderAPI,
  {
    openButtonId,
    modalId,
    closeButtonId,
  }: { openButtonId: string; modalId: string; closeButtonId: string }
): Promise<void> => {
  fireEvent.press(renderAPI.getByTestId(openButtonId));
  await waitFor(() => expect(renderAPI.getByTestId(modalId)).toBeTruthy());
  fireEvent.press(renderAPI.getByTestId(closeButtonId));
  await waitFor(() => expect(renderAPI.queryByTestId(modalId)).toBeNull());
};

const toggleCampusTest = async (
  getByTestId: RenderAPI["getByTestId"],
  getByText: RenderAPI["getByText"]
): Promise<void> => {
  fireEvent.press(getByTestId("toggle-campus-button-hamburger-button"));
  await waitFor(() => expect(getByText("View SGW Campus")).toBeTruthy());
  const toggleButton = getByTestId("toggle-campus-button-toggle-campus-button");
  fireEvent.press(toggleButton);
  await waitFor(() => expect(getByText("View Loyola Campus")).toBeTruthy());
  fireEvent.press(toggleButton);
  await waitFor(() => expect(getByText("View SGW Campus")).toBeTruthy());
};

const openSearchModalAndFetchRoute = async (
  getByTestId: RenderAPI["getByTestId"]
): Promise<void> => {
  fireEvent.press(getByTestId("nav-tab-nav-item-Search"));
  await waitFor(() => getByTestId("search-modal"));
  fireEvent.press(getByTestId("search-modal-get-directions-button"));
  await waitFor(() => getByTestId("route-polyline"));
};

const openEatMode = (getByTestId: RenderAPI["getByTestId"]): void =>
  fireEvent.press(getByTestId("nav-tab-nav-item-Eat"));

// Additional helper for Filter and Radius modals
const openFilterModal = async (
  getByTestId: RenderAPI["getByTestId"],
  getByText: RenderAPI["getByText"]
): Promise<void> => {
  openEatMode(getByTestId);
  const filterButton = await waitFor(() => getByText("Filter Places"));
  fireEvent.press(filterButton);
  await waitFor(() => getByTestId("filter-modal"));
};

const openRadiusAdjusterModal = async (
  getByTestId: RenderAPI["getByTestId"],
  getByText: RenderAPI["getByText"]
): Promise<void> => {
  openEatMode(getByTestId);
  const adjustButton = await waitFor(() => getByText("Adjust Search Radius"));
  fireEvent.press(adjustButton);
  await waitFor(() => getByTestId("radius-adjuster-modal"));
};

// ---------------------
// Test Suites
// ---------------------
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
    await toggleCampusTest(getByTestId, getByText);
  });

  it("should display a destination marker when a location is long-pressed on the map", async () => {
    const { getByTestId } = renderCampusMap();
    simulateLongPressOnMap(getByTestId);
    await waitFor(() =>
      expect(getByTestId("destination-marker-marker")).toBeTruthy()
    );
  });

  it("should display building markers on the map and open modal when clicked", async () => {
    const { getByTestId, queryByTestId } = renderCampusMap();
    fireEvent.press(getByTestId("building-marker-FB-marker"));
    await waitFor(() =>
      expect(getByTestId("building-info-modal-content")).toBeTruthy()
    );
    fireEvent.press(getByTestId("building-info-modal-close-button"));
    await waitFor(() =>
      expect(queryByTestId("building-info-modal-content")).toBeNull()
    );
  });

  it("should open and close the TransitModal when the directions button is pressed", async () => {
    const renderAPI = renderCampusMap();
    simulateLongPressOnMap(renderAPI.getByTestId);
    await waitFor(() =>
      expect(renderAPI.getByTestId("destination-marker-marker")).toBeTruthy()
    );
    await openCloseModal(renderAPI, {
      openButtonId: "nav-tab-nav-item-Directions",
      modalId: "transit-modal-modal",
      closeButtonId: "transit-modal-close-button",
    });
  });

  it("should open and close the NextClassModal when the next class button is pressed", async () => {
    const renderAPI = renderCampusMap();
    await openCloseModal(renderAPI, {
      openButtonId: "nav-tab-nav-item-Class",
      modalId: "next-class-modal-overlay",
      closeButtonId: "next-class-modal-close-button",
    });
  });

  it("should reset destination when back button is pressed in NavTab", async () => {
    const { getByTestId, queryByTestId } = renderCampusMap();
    simulateLongPressOnMap(getByTestId);
    await waitFor(() =>
      expect(getByTestId("destination-marker-marker")).toBeTruthy()
    );
    fireEvent.press(getByTestId("nav-tab-nav-item-Back"));
    await waitFor(() =>
      expect(queryByTestId("destination-marker-marker")).toBeNull()
    );
  });

  it("should open and close the Search Modal when the search button is pressed", async () => {
    const renderAPI = renderCampusMap();
    await openCloseModal(renderAPI, {
      openButtonId: "nav-tab-nav-item-Search",
      modalId: "search-modal",
      closeButtonId: "search-modal-close-icon",
    });
  });

  it("swaps origin and destination when handleOnUseAsOrigin is called", async () => {
    const { getByTestId, queryByTestId } = renderCampusMap();
    fireEvent.press(getByTestId("building-marker-FB-marker"));
    await waitFor(() =>
      expect(
        queryByTestId("building-info-modal-use-as-origin-button")
      ).toBeTruthy()
    );
    fireEvent.press(getByTestId("building-info-modal-use-as-origin-button"));
    await waitFor(() =>
      expect(
        queryByTestId("building-info-modal-use-as-origin-button")
      ).toBeNull()
    );
  });

  it("should alert when location permission is not granted", async () => {
    const { requestForegroundPermissionsAsync } = require("expo-location");
    requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    renderCampusMap();
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      )
    );
  });

  it("should alert when fetching route with missing destination", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = renderCampusMap();
    fireEvent.press(getByTestId("nav-tab-nav-item-Search"));
    await waitFor(() => expect(getByTestId("search-modal")).toBeTruthy());
    fireEvent.press(getByTestId("search-modal-get-directions-button"));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("Select a destination point")
    );
  });

  it("should fetch route and render polyline when origin and destination exist", async () => {
    const { getByTestId } = renderCampusMap();
    simulateLongPressOnMap(getByTestId);
    await waitFor(() =>
      expect(getByTestId("destination-marker-marker")).toBeTruthy()
    );
    await openSearchModalAndFetchRoute(getByTestId);
  });

  it("should alert when Go Indoor is pressed with no indoor map available", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = renderCampusMap();
    fireEvent.press(getByTestId("building-marker-FB-marker"));
    await waitFor(() =>
      expect(getByTestId("building-info-modal-content")).toBeTruthy()
    );
    fireEvent.press(getByTestId("nav-tab-nav-item-Search"));
    await waitFor(() => expect(getByTestId("search-modal")).toBeTruthy());
    fireEvent.press(getByTestId("search-modal-get-directions-button"));
    await waitFor(() => {
      expect(getByTestId("route-polyline")).toBeTruthy();
      expect(getByTestId("indoor-button")).toBeTruthy();
    });
    fireEvent.press(getByTestId("indoor-button"));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "Indoor Map Not Available",
        "Indoor map is not available for this building."
      )
    );
  });

  it("should alert when More Options is pressed in NavTab", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = renderCampusMap();
    fireEvent.press(getByTestId("nav-tab-nav-item-MoreOptions"));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("More Options pressed")
    );
  });

  it("should open BuildingInfoModal when Info is pressed in NavTab", async () => {
    const { getByTestId } = renderCampusMap();
    fireEvent.press(getByTestId("nav-tab-nav-item-Info"));
    await waitFor(() =>
      expect(getByTestId("building-info-modal-content")).toBeTruthy()
    );
  });

  it("should show radius adjuster when eating mode is activated", async () => {
    const { getByTestId, getByText } = renderCampusMap();
    openEatMode(getByTestId);
    await waitFor(() => expect(getByText("Adjust Search Radius")).toBeTruthy());
    fireEvent.press(getByText("Adjust Search Radius"));
  });
});

describe("Additional Modals and Components", () => {
  it("should update search radius when RadiusAdjuster callbacks are triggered", async () => {
    const { getByTestId, getByText, queryByTestId } = renderCampusMap();
    await openRadiusAdjusterModal(getByTestId, getByText);
    const slider = getByTestId("radius-adjuster-radius-slider");
    fireEvent(slider, "valueChange", 200);
    fireEvent.press(getByTestId("radius-adjuster-apply-button"));
    await waitFor(() =>
      expect(queryByTestId("radius-adjuster-modal")).toBeNull()
    );
  });

  it("should open the FilterModal and close it after applying filters", async () => {
    const { getByTestId, getByText, queryByTestId } = renderCampusMap();
    await openFilterModal(getByTestId, getByText);
    const restaurantSwitch = getByTestId("filter-modal-switch-restaurant");
    fireEvent(restaurantSwitch, "valueChange", false);
    fireEvent.press(getByTestId("filter-modal-apply-button"));
    await waitFor(() => expect(queryByTestId("filter-modal")).toBeNull());
  });

  it("should close the FilterModal when the cancel button is pressed", async () => {
    const { getByTestId, getByText, queryByTestId } = renderCampusMap();
    await openFilterModal(getByTestId, getByText);
    fireEvent.press(getByTestId("filter-modal-cancel-button"));
    await waitFor(() => expect(queryByTestId("filter-modal")).toBeNull());
  });

  it("should trigger optimize route behavior when pressedOptimizeRoute is true", async () => {
    const { getByTestId } = render(<CampusMap pressedOptimizeRoute={true} />);

    await waitFor(() => {
      expect(getByTestId("next-class-modal-overlay")).toBeTruthy();
    });
  });

  it("should open search modal when pressedSearch is true", async () => {
    const { getByTestId } = render(<CampusMap pressedSearch={true} />);
    await waitFor(() => {
      expect(getByTestId("search-modal")).toBeTruthy();
    });
  });
});
