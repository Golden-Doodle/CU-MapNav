import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CampusMap from "../CampusMap";

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
    status: "granted",
  }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 45.5017,
      longitude: -73.5673,
    },
  }),
}));

jest.mock("@/app/services/GoogleMap/googlePlacesService", () => ({
  fetchNearbyRestaurants: jest.fn().mockImplementation(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            place_id: "1",
            name: "Restaurant 1",
            geometry: { location: { lat: 45.5017, lng: -73.5673 } },
            vicinity: "Near campus",
            rating: 4.5,
          },
        ]);
      }, 1000); 
    });
  }),
}));

describe("CampusMap", () => {
  it("should render the map", () => {
    const { getByTestId } = render(<CampusMap pressedOptimizeRoute={false} />);
    const map = getByTestId("campus-map");
    expect(map).toBeTruthy();
  });

  it("should toggle between SGW and Loyola campuses when button pressed", async () => {
    const { getByTestId, getByText } = render(<CampusMap pressedOptimizeRoute={false} />);

    const hamburgerButton = getByTestId("toggle-campus-button-hamburger-button");
    fireEvent.press(hamburgerButton);

    const toggleButton = getByTestId("toggle-campus-button-toggle-campus-button");
    fireEvent.press(toggleButton);

    await waitFor(() => {
      expect(getByText("View SGW Campus")).toBeTruthy();
    });

    fireEvent.press(toggleButton);

    await waitFor(() => {
      expect(getByText("View Loyola Campus")).toBeTruthy();
    });
  });

  it("should display a destination marker when a location is long-pressed on the map", async () => {
    const { getByTestId } = render(<CampusMap pressedOptimizeRoute={false} />);
    const map = getByTestId("campus-map");

    fireEvent(map, "onLongPress", {
      nativeEvent: {
        coordinate: { latitude: 45.5017, longitude: -73.5673 },
      },
    });

    await waitFor(() => {
      expect(getByTestId("destination-marker")).toBeTruthy();
    });
  });

  it("should display the loading spinner while fetching restaurants", async () => {
    const { getByTestId, queryByTestId, findAllByTestId } = render(<CampusMap pressedOptimizeRoute={false} />);
    const eatButton = getByTestId("nav-tab-nav-item-Eat");
    fireEvent.press(eatButton);
  
    // Step 1: Ensure the loading spinner appears
    await waitFor(() => {
      expect(getByTestId("loading-spinner")).toBeTruthy();
    });
  
    // Step 2: Wait for restaurant markers to appear instead of a restaurant list
    const restaurantMarkers = await findAllByTestId(/restaurant-marker-.*/);
  
    // Step 3: Now check if the spinner is gone
    await waitFor(() => {
      expect(queryByTestId("loading-spinner")).toBeNull();
    });
  
    // Step 4: Ensure restaurant markers are rendered
    expect(restaurantMarkers.length).toBeGreaterThan(0);
  });
  

  it("should display building markers on the map and open modal when clicked", async () => {
    const { getByTestId, queryByTestId } = render(<CampusMap pressedOptimizeRoute={false} />);
    const buildingMarker = getByTestId("building-marker-1-marker");
    expect(buildingMarker).toBeTruthy();

    fireEvent.press(buildingMarker);

    await waitFor(() => {
      expect(getByTestId("building-info-modal-content")).toBeTruthy();
    });

    const closeButton = getByTestId("building-info-modal-close-button");
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(queryByTestId("building-info-modal-content")).toBeNull();
    });
  });
  
  it("should open and close the TransitModal when the directions button is pressed", async () => {
    const { getByTestId, queryByTestId } = render(<CampusMap pressedOptimizeRoute={false} />);
  
    const map = getByTestId("campus-map");
    fireEvent(map, "onLongPress", {
      nativeEvent: {
        coordinate: { latitude: 45.5017, longitude: -73.5673 },
      },
    });
  
    await waitFor(() => {
      expect(getByTestId("destination-marker")).toBeTruthy();
    });
  
    const directionsButton = getByTestId("nav-tab-nav-item-Directions");
    fireEvent.press(directionsButton);
  
    await waitFor(() => {
      expect(getByTestId("transit-modal-modal")).toBeTruthy(); 
    });
  
    const closeButton = getByTestId("transit-modal-close-button");
    fireEvent.press(closeButton);
  
    await waitFor(() => {
      expect(queryByTestId("transit-modal-modal")).toBeNull();
    });
  });
  
  
  it("should open and close the NextClassModal when the next class button is pressed", async () => {
    const { getByTestId, queryByTestId } = render(<CampusMap pressedOptimizeRoute={false} />);
  
    const nextClassButton = getByTestId("nav-tab-nav-item-Class");
    fireEvent.press(nextClassButton);
  
    await waitFor(() => {
      expect(getByTestId("next-class-modal-overlay")).toBeTruthy();
    });
  
    const closeButton = getByTestId("next-class-modal-close-button");
    fireEvent.press(closeButton);
  
    await waitFor(() => {
      expect(queryByTestId("next-class-modal-overlay")).toBeNull();
    });
  });
  

  it("should reset destination when back button is pressed in NavTab", async () => {
    const { getByTestId, queryByTestId } = render(<CampusMap pressedOptimizeRoute={false} />);

    fireEvent(getByTestId("campus-map"), "onLongPress", {
      nativeEvent: { coordinate: { latitude: 45.5017, longitude: -73.5673 } },
    });

    await waitFor(() => {
      expect(getByTestId("destination-marker")).toBeTruthy();
    });

    const backButton = getByTestId("nav-tab-nav-item-Back");
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(queryByTestId("destination-marker")).toBeNull();
    });
  });



  it("should open and close the Search Modal when the search button is pressed", async () => {
    const { getByTestId, queryByTestId } = render(<CampusMap pressedOptimizeRoute={false} />);
  
    const searchButton = getByTestId("nav-tab-nav-item-Search");
    fireEvent.press(searchButton);
  
    await waitFor(() => {
      expect(getByTestId("search-modal")).toBeTruthy();
    });
  
    const closeButton = getByTestId("search-modal-close-icon");
    fireEvent.press(closeButton);
  
    await waitFor(() => {
      expect(queryByTestId("search-modal")).toBeNull();
    });
  });
  
});
