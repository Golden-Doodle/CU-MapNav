import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { View } from "react-native";
import HamburgerWidget from "../HamburgerWidget";
import { Campus } from "@/app/utils/types";

describe("HamburgerWidget Component", () => {
  const mockToggleCampus = jest.fn();
  const mockSetViewCampusMap = jest.fn();

  test("renders the hamburger button correctly", async () => {
    const { getByTestId } = render(
      <View>
        <HamburgerWidget
          toggleCampus={mockToggleCampus}
          viewCampusMap={false}
          setViewCampusMap={mockSetViewCampusMap}
          campus={"SGW" as Campus}
          testID="hamburger-widget" 
        />
      </View>
    );

    await waitFor(() => expect(getByTestId("hamburger-widget-hamburger-button")).toBeTruthy());
  });

  test("toggles visibility of menu when hamburger button is clicked", async () => {
    const { getByTestId, queryByTestId } = render(
      <View>
        <HamburgerWidget
          toggleCampus={mockToggleCampus}
          viewCampusMap={false}
          setViewCampusMap={mockSetViewCampusMap}
          campus={"SGW" as Campus}
          testID="hamburger-widget"
        />
      </View>
    );

    const hamburgerButton = getByTestId("hamburger-widget-hamburger-button");

    expect(queryByTestId("hamburger-widget-menu-options")).toBeNull();

    fireEvent.press(hamburgerButton);
    await waitFor(() => expect(getByTestId("hamburger-widget-menu-options")).toBeTruthy());

    fireEvent.press(hamburgerButton);
    await waitFor(() => expect(queryByTestId("hamburger-widget-menu-options")).toBeNull());
  });

  test("toggles the campus map switch", async () => {
    const { getByTestId } = render(
      <View>
        <HamburgerWidget
          toggleCampus={mockToggleCampus}
          viewCampusMap={false}
          setViewCampusMap={mockSetViewCampusMap}
          campus={"SGW" as Campus}
          testID="hamburger-widget"
        />
      </View>
    );
  
    fireEvent.press(getByTestId("hamburger-widget-hamburger-button"));
    await waitFor(() => expect(getByTestId("hamburger-widget-menu-options")).toBeTruthy());
  
    fireEvent(getByTestId("hamburger-widget-campus-map-switch"), "valueChange", true);
  
    expect(mockSetViewCampusMap).toHaveBeenCalled(); 
  });
  

  test("toggles dark mode switch", async () => {
    const { getByTestId } = render(
      <View>
        <HamburgerWidget
          toggleCampus={mockToggleCampus}
          viewCampusMap={false}
          setViewCampusMap={mockSetViewCampusMap}
          campus={"SGW" as Campus}
          testID="hamburger-widget" 
        />
      </View>
    );

    fireEvent.press(getByTestId("hamburger-widget-hamburger-button")); 
    await waitFor(() => expect(getByTestId("hamburger-widget-menu-options")).toBeTruthy());

    fireEvent.press(getByTestId("hamburger-widget-dark-mode-switch"));
    expect(getByTestId("hamburger-widget-dark-mode-switch")).toBeTruthy();
  });

  test("calls toggleCampus when campus switch button is pressed", async () => {
    const { getByTestId } = render(
      <View>
        <HamburgerWidget
          toggleCampus={mockToggleCampus}
          viewCampusMap={false}
          setViewCampusMap={mockSetViewCampusMap}
          campus={"SGW" as Campus}
          testID="hamburger-widget"
        />
      </View>
    );

    fireEvent.press(getByTestId("hamburger-widget-hamburger-button"));
    await waitFor(() => expect(getByTestId("hamburger-widget-menu-options")).toBeTruthy());

    fireEvent.press(getByTestId("hamburger-widget-toggle-campus-button"));
    expect(mockToggleCampus).toHaveBeenCalled();
  });
});
